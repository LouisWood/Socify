const { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion,
    getDiscussionsByUserID, getUsersFromName, getDiscussionsFromName,
    getDiscussionNumberOfParticipant, getAllDiscussions, createDiscussion,
    createDiscussionUser, insertFollower, joinDiscussion,
    getFollow, getDiscussionOwner, getFollowID,
    getMessagesWaiting, setDiscussionLastView, checkIfUserInDiscussion,
    getDiscussion, getFollowerDiscussionID } = require('./modules/database')

const { getArtistTopTracks, getTracksInfo, getPlaylistByID } = require('./modules/music')
const { checkIfTokenIsExpired, getAccessToken } = require('./modules/token')
const { getUserInfo, getCurrentUserPlaylists, getCurrentUserTopArtists,
    getCurrentUserTopTracks, setCurrentUserPlaylist, fillCurrentUserPlaylist,
    getUserLastDiscussion, getUserDiscussions, getUserDiscussionMessages,
    getDiscussionUsersStatus, getUserDiscussionScrollPosition, setUserLastDiscussion,
    setUserDiscussionScrollPosition, getUser, getTArtist, 
    getTTrack, getOthers, getFollowed, getFollower } = require('./modules/user')

const express = require('express')
const cors = require ('cors')
const cookieParser = require('cookie-parser')
const { encryptCookieNodeMiddleware, decryptCookieSocketMiddleware } = require('encrypt-cookie')
const { URLSearchParams } = require('url')

require('dotenv').config()

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
        method: ['GET', 'POST']
    }
})

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    method: ['GET', 'POST']
}))
app.use(express.json())
app.use(cookieParser(process.env.SIGNATURE_SECRET))
app.use(encryptCookieNodeMiddleware(process.env.ENCRYPTION_SECRET))

app.get('/', (req, res) => {
    res.redirect('http://localhost:3000/')
})

app.get('/login', (req, res) => {
    const userID = req.signedCookies ? req.signedCookies['userID'] : null
    
    if (userID) {
        res.redirect('http://localhost:3000/')
        return
    }

    const randomNumber = Math.random().toString()
    const state = randomNumber.substring(2, randomNumber.length)

    res.cookie('state', state, {signed: true})

    const params = new URLSearchParams()

    params.set('client_id', process.env.CLIENT_ID)
    params.set('response_type', 'code')
    params.set('redirect_uri', encodeURI(process.env.REDIRECT_URI))
    params.set('state', state)
    params.set('scope', process.env.SCOPE)
    
    res.redirect('https://accounts.spotify.com/authorize?' + params)
})

app.get('/logout', async (req, res) => {
    res.clearCookie('userID')
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.clearCookie('expireTime')

    res.end()
})

app.get('/callback', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies['userID'] : null

    if (userID) {
        res.redirect('http://localhost:3000/')
        return
    }

    const code = req.query.code
    const state = req.query.state
    const error = req.query.error
    const storedState = req.signedCookies ? req.signedCookies.state : null
    
    if (!error || state === storedState) {
        res.clearCookie('state')

        const resToken = await getAccessToken(code)

        if ('res' in resToken) {
            const resUser = await getUserInfo(resToken.res.access_token)
            const rangeTerm = ["short_term", "medium_term", "long_term"]
            const resTopA = []
            const resTopT = []

            for(i = 0; i < rangeTerm.length; i++) {
                resTopA.push(await getCurrentUserTopArtists(resToken.res.access_token, rangeTerm[i]))
                resTopT.push(await getCurrentUserTopTracks(resToken.res.access_token, rangeTerm[i]))
            }

            if ('res' in resUser)
                await insertUserInDatabase(res, resUser.res, resToken.res, resTopA, resTopT)
        }
    }
    res.redirect('http://localhost:3000/me')
})

app.get('/me', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    const access_token = req.signedCookies.access_token
    const response = await getUserInfo(access_token)
    
    res.json(response)
})

app.get('/me/playlists', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return

    const access_token = req.signedCookies.access_token
    const response = await getCurrentUserPlaylists(access_token)
    
    res.json(response)
})

app.post('/me/top/artists', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return

    if ('time_range' in req.body){
        const access_token = req.signedCookies.access_token
        const time_range = req.body.time_range
        const response = await getCurrentUserTopArtists(access_token, time_range)
        
        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.post('/me/top/tracks', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return

    if ('time_range' in req.body){
        const access_token = req.signedCookies.access_token
        const time_range = req.body.time_range
        const response = await getCurrentUserTopTracks(access_token, time_range)
        
        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.post('/users/me/playlists', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if (req.signedCookies['userID'] && 'playlistName' in req.body && 'playlistDesc' in req.body) {
        const userID = req.signedCookies.userID
        const access_token = req.signedCookies.access_token
        const playlistName = req.body.playlistName
        const playlistDesc = req.body.playlistDesc
        const response = await setCurrentUserPlaylist(userID, access_token, playlistName, playlistDesc)

        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/playlists/playlistID/tracks', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('playlistID' in req.body && 'tracksUris' in req.body) {
        const access_token = req.signedCookies.access_token
        const playlistID = req.body.playlistID
        const tracksUris = req.body.tracksUris
        const response = await fillCurrentUserPlaylist(access_token, playlistID, tracksUris)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/artists/artistID/top-tracks', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('artistID' in req.body) {
        const access_token = req.signedCookies.access_token
        const artistID = req.body.artistID
        const response = await getArtistTopTracks(access_token, artistID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/audio-features/trackID', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('trackID' in req.body) {
        const access_token = req.signedCookies.access_token
        const trackID = req.body.trackID
        const response = await getTracksInfo(access_token, trackID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/playlists/playlistID', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('playlistID' in req.body) {
        const access_token = req.signedCookies.access_token
        const playlistID = req.body.playlistID
        const response = await getPlaylistByID(access_token, playlistID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})


app.get('/bd/me/user', async(req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if(userID) {
        const response = await getUser(userID)
        res.json(response)
    }
    else {
        res.json({ error : 'Error'})
    }
})

app.get('/bd/me/top/artist', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if(userID){
        if ('time_range' in req.query) {
            time_range = req.query.time_range
       } else {
            time_range = 'short_term'
       }

        const response = await getTArtist(userID, time_range)
        res.json(response)
    } else 
        res.json({ error : 'Error'})
})

app.get('/bd/me/top/track', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if(userID) {
        if ('time_range' in req.query) {
             time_range = req.query.time_range
        } else {
             time_range = 'short_term'
        }

        const response = await getTTrack(userID, time_range)
        res.json(response)
    } else 
        res.json({ error : 'Error'})
})

app.get('/bd/user', async(req, res) => {
    if('userID' in req.query) {
        const response = await getUser(req.query.userID)
        res.json(response)
    } else 
        res.json({ error : 'Error'})
})

app.get('/bd/top/artist', async (req, res) => {
    if ('userID' in req.query){
        const userID = req.query.userID
        if ('time_range' in req.query) {
             time_range = req.query.time_range
        } else {
             time_range = 'short_term'
        }

        const response = await getTArtist(userID, time_range)
        res.json(response)
    } else {
        res.json({ error: 'Error'})
    } 
        
})

app.get('/bd/top/track', async (req, res) => {

    if ('userID' in req.query){
        const userID = req.query.userID
        if ('time_range' in req.query) {
             time_range = req.query.time_range
        } else {
             time_range = 'short_term'
        }

        const response = await getTTrack(userID, time_range)
        res.json(response)
    } else {
        res.json({ error: 'Error'})
    } 
        
})

app.get('/bd/others', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if(userID) {
        const response = await getOthers(userID)
        res.json(response)
    } else 
        res.json({ error: 'Error'})
})

app.get('/bd/followed', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null
    if(userID) {
        const response = await getFollowed(userID)
        res.json(response)
    } else  
        res.json({ error: 'Error'})
})

app.get('/bd/follower', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null
    if(userID) {
        const response = await getFollower(userID)
        res.json(response)
    } else 
        res.json({ error: 'Error'})
})

app.get('/lastDiscussion', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID) {
        const response = await getUserLastDiscussion(userID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.get('/discussions', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID) {
        const response = await getUserDiscussions(userID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/lastScrollPosition', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'discussionID' in req.body) {
        const discussionID = req.body.discussionID

        const response = await getUserDiscussionScrollPosition(userID, discussionID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/messages', async (req, res) => {
    if ('discussionID' in req.body) {
        const discussionID = req.body.discussionID

        const response = await getUserDiscussionMessages(discussionID)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/usersStatus', async (req, res) => {
    if ('discussionID' in req.body) {
        const discussionID = req.body.discussionID
        const sockets = await io.in(discussionID).fetchSockets()

        const response = await getDiscussionUsersStatus(discussionID, sockets)
        
        res.json(response)
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/lastDiscussion', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'lastDiscussion' in req.body) {
        const lastDiscussion = req.body.lastDiscussion

        await setUserLastDiscussion(userID, lastDiscussion)
        
        res.json({
            res: 'Done'
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/scrollPosition', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'discussionID' in req.body && 'scrollPosition' in req.body) {
        const discussionID = req.body.discussionID
        const scrollPosition = req.body.scrollPosition

        await setUserDiscussionScrollPosition(userID, discussionID, scrollPosition)
        
        res.json({
            res: 'Done'
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/search', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'name' in req.body) {
        const name = req.body.name

        const users = await getUsersFromName(userID, name)
        const discussions = await getDiscussionsFromName(name)

        if (users.length > 0)
            users.sort((user1, user2) => user1.name - user2.name)

        if (discussions.length > 0) {
            discussions.sort((discussion1, discussion2) => discussion1.name - discussion2.name)
            for (const discussion of discussions) {
                let connectUsers = []
                const sockets = await io.to(discussion.discussionID).fetchSockets()
                
                for (const socket of sockets)
                    if (connectUsers.indexOf(socket.userID) === -1)
                        connectUsers.push(socket.userID)

                discussion.online = connectUsers.length
                discussion.members = await getDiscussionNumberOfParticipant(discussion.discussionID)
            }
        }
        
        res.json({
            res: {
                name: name,
                users: users,
                discussions: discussions
            }
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/followUser', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'userID' in req.body) {
        const followID = req.body.userID

        const discussion = await getFollowerDiscussionID(userID, followID)

        console.log(discussion)

        const discussionID = discussion.length > 0 ? discussion[0].discussionID : await createDiscussionUser(userID)

        await insertFollower(userID, followID, discussionID)
        
        res.json({
            res: discussionID
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/joinDiscussion', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'discussionID' in req.body) {
        const discussionID = req.body.discussionID

        await joinDiscussion(userID, discussionID, new Date((Date.parse(new Date())) - 1))
        
        res.json({
            res: 'done'
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/createDiscussion', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'name' in req.body && 'picture' in req.body) {
        const name = req.body.name
        const picture = req.body.picture

        const response = await createDiscussion(userID, name, picture)
        
        res.json({
            res: response
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.get('/discussionsTrend', async (req, res) => {
    const discussions = await getAllDiscussions()

    if (discussions.length > 0) {
        for (const discussion of discussions) {
            let connectUsers = []
            const sockets = await io.to(discussion.discussionID).fetchSockets()
            
            for (const socket of sockets)
                if (connectUsers.indexOf(socket.userID) === -1)
                    connectUsers.push(socket.userID)

            discussion.online = connectUsers.length
            discussion.members = await getDiscussionNumberOfParticipant(discussion.discussionID)
        }
        discussions.sort((discussion1, discussion2) => discussion2.members - discussion1.members)

        if (discussions.length > 9)
            discussions.slice(1, 9)
    }
    
    res.json({
        res: discussions
    })
})

app.get('/follow', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID) {
        const response = await getFollow(userID)
        
        res.json({
            res: response
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.get('/messagesWaiting', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID) {
        const response = await getMessagesWaiting(userID)
        
        res.json({
            res: Array.from(response)
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.post('/lastView', async (req, res) => {
    const userID = req.signedCookies ? req.signedCookies.userID : null

    if (userID && 'discussionID' in req.body && 'lastView' in req.body) {
        const discussionID = req.body.discussionID
        const lastView = req.body.lastView

        await setDiscussionLastView(userID, discussionID, lastView)
        
        res.json({
            res: 'Done'
        })
    } else {
        res.json({
            error: 'Error'
        })
    }
})

app.get('*', (req, res) => {
    res.redirect('http://localhost:3000/')
})

io.use(decryptCookieSocketMiddleware(process.env.SIGNATURE_SECRET, process.env.ENCRYPTION_SECRET))

io.on('connection', async socket => {
    if (socket.handshake.signedCookies && 'userID' in socket.handshake.signedCookies)
        socket.userID = socket.handshake.signedCookies.userID

    socket.on('initDiscussions', async () => {
        const discussions = await getDiscussionsByUserID(socket.userID)

        if (discussions.res.length > 0) {
            for (const discussion of discussions.res) {
                socket.join(discussion.discussionID)
                io.to(discussion.discussionID).emit('updateStatus', {discussionID: discussion.discussionID})
            }
        }
    })

    socket.on('sendMessage', async data => {
        if (await getDiscussionOwner(data.discussionID) === '') {
            const followID = await getFollowID(data.discussionID)
            const discussion = await checkIfUserInDiscussion(followID, data.discussionID)

            if (discussion.length === 0) {
                await joinDiscussion(followID, data.discussionID, new Date((Date.parse(new Date())) - 1))

                let socketFollow = null
                const sockets = await io.fetchSockets()

                for (const socket of sockets)
                    if (socket.userID === followID)
                        socketFollow = socket

                if (socketFollow.id) {
                    socketFollow.join(data.discussionID)

                    const discussions = await getDiscussionsByUserID(followID)
                    io.in(socketFollow.id).emit('receiveMessageDiscussion', {
                        discussions: discussions.res
                    })
                }
            }
        }

        const message = await insertMessageInDiscussion(data.discussionID, socket.userID, data.content)

        message.discussionID = data.discussionID
        message.userID = socket.userID
        message.content = data.content

        io.to(data.discussionID).emit('receiveMessage', message)
    })

    socket.on('joinDiscussion', async data => {
        socket.join(data.discussionID)
        io.to(data.discussionID).emit('updateStatus', {discussionID: data.discussionID})

        if (data.type) {
            const message = await insertMessageInDiscussion(data.discussionID, socket.userID, `${data.name} a rejoint la discussion`)
    
            message.discussionID = data.discussionID
            message.userID = socket.userID
            message.content = `${data.name} a rejoint la discussion`

            io.to(data.discussionID).emit('receiveMessage', message)
        }
    })

    socket.on('disconnect', async () => {
        const discussions = await getDiscussion(socket.userID)

        if (discussions.length > 0)
            for (const discussion of discussions)
                io.to(discussion.discussionID).emit('updateStatus', {discussionID: discussion.discussionID})
    })
})

server.listen(8000, async () => {
    console.log('Listening on port 8000')
    await createDatabaseIfNotExist()
})
