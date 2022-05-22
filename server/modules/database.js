const fs = require('fs')
const { parseDate } = require('./common')

require('dotenv').config()

const dbExist = fs.existsSync(process.env.DB_PATH)
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: process.env.DB_PATH
    },
    useNullAsDefault: true
})

const createDatabaseIfNotExist = async () => {
    if (!dbExist) {
        await knex.schema.createTable('Artist', function (table) {
            table.string('artistID').primary().notNullable()
            table.string('name').notNullable()
            table.string('image').notNullable()
        })

        await knex.schema.createTable('Track', function (table) {
            table.string('trackID').primary().notNullable()
            table.string('name').notNullable()
            table.string('uri').notNullable()
            table.string('image').notNullable()
            table.string('artistName').notNullable()
            table.string('albumName').notNullable()
            table.string('duration').notNullable()
        })

        await knex.schema.createTable('TopArtistList', function (table) {
            table.primary(['listID', 'range'])
            table.string('listID').notNullable()
            table.string('range').notNullable()

            for(i = 0; i < 20; i++) {
                table.string('artistID' + i)
                table.foreign('artistID' + i).references('Artist.artistID')
            }

            table.foreign('listID').references('Users.userID')
        }) 

        await knex.schema.createTable('TopTrackList', function (table) {
            table.primary(['ListID', 'range'])
            table.string('listID').notNullable()
            table.string('range').notNullable()

            for(i = 0; i < 20; i++) {
                table.string('trackID' + i)
                table.foreign('trackID' + i).references('Track.trackID')
            }

            table.foreign('listID').references('Users.userID')
        })

        await knex.schema.createTable('Users', function (table) {
            table.string('userID').primary().notNullable()
            table.string('name').notNullable()
            table.string('picture').notNullable()
            table.integer('lastDiscussion').notNullable()
        })

        await knex.schema.createTable('Followers', function (table) {
            table.string('userID').notNullable()
            table.string('followerID').notNullable()
            table.integer('discussionID').notNullable()
            table.primary(['userID', 'followerID'])
            table.foreign('userID').references('Users.userID')
            table.foreign('followerID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })

        await knex.schema.createTable('Discussions', function (table) {
            table.increments('discussionID').primary()
            table.string('owner').notNullable()
            table.string('name').notNullable()
            table.string('picture').notNullable()
            table.foreign('owner').references('Users.userID')
        })

        await knex.schema.createTable('Messages', function (table) {
            table.increments('messageID').primary()
            table.integer('discussionID').notNullable()
            table.string('userID').notNullable()
            table.string('content').notNullable()
            table.string('date').notNullable()
            table.foreign('discussionID').references('Discussions.discussionID')
            table.foreign('userID').references('Users.userID')
        })

        await knex.schema.createTable('Participate', function (table) {
            table.string('userID').notNullable()
            table.integer('discussionID').notNullable()
            table.string('lastView').notNullable()
            table.integer('scrollPosition').notNullable()
            table.primary(['userID', 'discussionID'])
            table.foreign('userID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })
    }
}

const insertUserInDatabase = async (res, userData, tokenData, topArtistT, topTrackT) => {
    const currentTime = new Date()
    const expireTime = new Date(currentTime.getTime() + 55 * 60 * 1000)
    const picture = userData.images.length > 0 ? userData.images[0].url : ''
    const rangeTerm = ['short_term', 'medium_term', 'long_term']

    res.cookie('userID', userData.id, {signed: true})
    res.cookie('access_token', tokenData.access_token, {signed: true})
    res.cookie('refresh_token', tokenData.refresh_token, {signed: true})
    res.cookie('expireTime', expireTime.toString(), {signed: true})

    const rows = await knex('Users').select('*').where('userID', '=', userData.id)

    if (rows.length !== 1) {
        await knex('Users').insert({userID: userData.id, name: userData.display_name, picture: picture, lastDiscussion: -1})
        
        for(i = 0; i < rangeTerm.length; i++) {
            await knex('TopArtistList').insert({listID: userData.id, range: rangeTerm[i]}) 
            await knex('TopTrackList').insert({listID: userData.id, range: rangeTerm[i]}) 
        }

        await fillTopArtistInDatabase(topArtistT, userData.id); 
        await fillTopTrackInDatabase(topTrackT, userData.id)
    }
}

const fillTopArtistInDatabase = async (topArtist, listID) => {
    const rangeTerm = ['short_term', 'medium_term', 'long_term']
    
    for(j = 0; j < topArtist.length; j++) {
        topArtistElement = topArtist[j].res.items

        if(topArtistElement.length > 1) {
            for(i = 0; i < topArtistElement.length; i++) {
                await knex.raw('UPDATE TopArtistList SET artistID' + i + ' = ? WHERE listID = ? AND range = ?', [topArtistElement[i].id, listID, rangeTerm[j]])
                const artistrow = await knex('Artist').select('*').where('artistID', '=', topArtistElement[i].id)
                if(artistrow.length == 0)
                    await knex('Artist').insert({artistID: topArtistElement[i].id, name: topArtistElement[i].name, image: topArtistElement[i].images[0].url})
            }
        }
    }
}

const fillTopTrackInDatabase = async (topTrack, listID) => {
    const rangeTerm = ['short_term', 'medium_term', 'long_term']

    for(l = 0; l < topTrack.length; l++) {
        topTrackElement = topTrack[l].res.items
        if(topTrackElement.length > 1) {
            for(k = 0; k < topTrackElement.length; k++) {
                await knex.raw('UPDATE TopTrackList SET trackID' + k + ' = ? WHERE ListID = ? AND range = ?', [topTrackElement[k].id, listID, rangeTerm[l]])
                const trackRow = await knex('Track').select('*').where('trackID', '=', topTrackElement[k].id)
                if(trackRow.length == 0)
                    await knex('Track').insert({trackID: topTrackElement[k].id, name: topTrackElement[k].name, 
                                               uri:topTrackElement[k].uri, image: topTrackElement[k].album.images[2].url, 
                                               artistName: topTrackElement[k].artists[0].name, albumName: topTrackElement[k].album.name, 
                                               duration: topTrackElement[k].duration_ms})
            }
        }
    }
}

const getLastDiscussionByUserID = async userID => {
    let lastDiscussion = -1
    const rows = await knex.select('lastDiscussion').from('Users').where('userID', '=', userID)

    if (rows.length === 1)
        lastDiscussion = rows[0].lastDiscussion
    
    return {
        res: lastDiscussion
    }
}

const getUserFromDB = async(userID) => {
   return (await knex.raw('SELECT * FROM Users WHERE userID = \'' + userID + '\' '))[0]
}

const getTopArtistsFromDB = async (userID, time_range) => {
    if ((await knex.select('userID').from('Users').where('userID', '=', userID)).length === 0)
        return null
    
    const topArtistList = Object.values((await knex.raw('SELECT * FROM TopArtistList WHERE range = \'' 
                                                        + time_range + '\' AND listID = \'' + userID +'\''))[0])
    artistDetails = []

    for(let i = 2; i < topArtistList.length; i++)
        artistDetails.push(await knex('Artist').select('*').where('artistID', '=', topArtistList[i]).andWhere('artistID', '!=', 'null'))

    return artistDetails
}

const getTopTrackFromDB = async(userID, time_range) => {
    if ((await knex.select('userID').from('Users').where('userID', '=', userID)).length === 0)
        return null
    
    const topTrackList = Object.values((await knex.raw('SELECT * FROM TopTrackList WHERE range = \'' 
                                                        + time_range + '\' AND listID = \'' + userID +'\''))[0])
    trackDetails = []

    for(let i = 2; i < topTrackList.length; i++)
        trackDetails.push(await knex('Track').select('*').where('trackID', '=', topTrackList[i]).andWhere('trackID', '!=', 'null'))
    
    return trackDetails
}

const getOtherUsersFromDB = async(userID) => {
    const users = await knex('Users').select('*').where('userID', '!=', userID)

    return users
}

const getFollowedUsers = async(userID) => {
    const followed = await getFollow(userID)
    const nbrFollowed = followed.length
    const userFollowed = []

    for( i = 0; i < followed.length; i++) {
        let user = await getUserFromDB(followed[i].userID)
        userFollowed.push(user)
    }

    return {nbrFollowed, userFollowed}
}

const getFollowersUsers = async(userID) => {
    const follower = await knex.select('followerID').from('Followers').where('userID', '=', userID)
    const nbrFollower = follower.length
    const userFollower = []

    for( i = 0; i < follower.length; i++) {
        let user = await getUserFromDB(follower[i].followerID)
        userFollower.push(user)
    }

    return {nbrFollower, userFollower}
}

const insertMessageInDiscussion = async (discussionID, userID, content) => {
    const date = new Date()
    let message = {date: date.toString()}
    const user = await knex.select('name', 'picture').from('Users').where('userID', '=', userID)

    await knex('Messages').insert({discussionID: discussionID, userID: userID, content: content, date: message.date})
    
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const hoursString = hours < 10 ? `0${hours}` : hours.toString()
    const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()

    message.rawDate = message.date
    message.dateMin = `${hoursString}:${minutesString}`
    message.date = parseDate(message.date)
    message.name = user[0].name
    message.picture = user[0].picture

    return message
}

const getDiscussionsByUserID = async userID => {
    let follow = []
    let discussions = []
    const participants = await knex.select('discussionID').from('Participate').where('userID', '=', userID)

    if (participants.length > 0) {
        for (const participant of participants) {
            const discussion = await knex.select('*').from('Discussions').where('discussionID', '=', participant.discussionID)
            if (discussion[0].owner !== '')
                discussions.push(discussion[0])
            else {
                const userInfo = await knex.select('name', 'picture').from('Users').where('userID', '!=', userID)
                discussion[0].name = userInfo[0].name
                discussion[0].picture = userInfo[0].picture
                follow.unshift(discussion[0])
            }
        }
    }

    return {
        res: follow.concat(discussions)
    }
}

const getMessagesByDiscussionID = async discussionID => {
    let messages = await knex.select('*').from('Messages').where('discussionID', '=', discussionID)
    
    if (messages.length > 0) {
        for (const message of messages) {
            const user = await knex.select('name', 'picture').from('Users').where('userID', '=', message.userID)

            const date = new Date(message.date)
            
            const hours = date.getHours()
            const minutes = date.getMinutes()

            const hoursString = hours < 10 ? `0${hours}` : hours.toString()
            const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()

            message.rawDate = message.date
            message.dateMin = `${hoursString}:${minutesString}`
            message.date = parseDate(message.date)
            message.name = user[0].name
            message.picture = user[0].picture
        }
    }

    return {
        res: messages
    }
}

const getDiscussionUsersByDiscussionID = async discussionID => {
    let response = []
    const participants = await knex.select('userID').from('Participate').where('discussionID', '=', discussionID)

    if (participants.length > 0) {
        for (const participant of participants) {
            const user = await knex.select('userID', 'name', 'picture').from('Users').where('userID', '=', participant.userID)
            response.push(user[0])
        }
    }

    return response
}

const getDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID) => {
    let scrollPosition = -1
    const participant = await knex.select('scrollPosition').from('Participate').where('userID', '=', userID).where('discussionID', '=', discussionID)

    if (participant.length > 0) {
        scrollPosition = participant[0].scrollPosition
    }

    return {
        res: scrollPosition
    }
}

const getUsersFromName = async (userID, name) => {
    return await knex.select('userID', 'name', 'picture').from('Users').where('name', 'like', `%${name}%`).where('userID', '!=', userID)
}

const getDiscussionsFromName = async name => {
    return await knex.select('discussionID', 'name', 'picture').from('Discussions').where('owner', '!=', '').where('name', 'like', `%${name}%`)
}

const getDiscussionNumberOfParticipant = async discussionID => {
    const discussions = await knex.select('userID').from('Participate').where('discussionID', '=', discussionID)
    return discussions.length
}

const getAllDiscussions = async () => {
    return await knex.select('discussionID', 'name', 'picture').from('Discussions').where('owner', '!=', '')
}

const setLastDiscussionByUserID = async (userID, lastDiscussion) => {
    await knex('Users').update('lastDiscussion', lastDiscussion).where('userID', '=', userID)
}

const setDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID, scrollPosition) => {
    await knex('Participate').update('scrollPosition', scrollPosition).where('userID', '=', userID).where('discussionID', '=', discussionID)
}

const createDiscussion = async (userID, name, picture) => {    
    const discussion = await knex('Discussions').insert({owner: userID, name: name, picture: picture}).then(data => {
        return data
    })

    await knex('Participate').insert({userID: userID, discussionID: discussion[0], lastView: (new Date()).toString(), scrollPosition: -1})

    return discussion[0]
}

const createDiscussionUser = async (userID) => {
    const discussion = await knex('Discussions').insert({owner: '', name: '', picture: ''}).then(data => {
        return data
    })

    await knex('Participate').insert({userID: userID, discussionID: discussion[0], lastView: (new Date()).toString(), scrollPosition: -1})

    return discussion[0]
}

const insertFollower = async (userID, follow, discussionID) => {
    await knex('Followers').insert({userID: follow, followerID: userID, discussionID: discussionID})
}

const joinDiscussion = async (userID, discussionID, date) => {
    await knex('Participate').insert({userID: userID, discussionID: discussionID, lastView: date.toString(), scrollPosition: -1})
}

const getFollow = async (userID) => {
    return await knex.select('userID').from('Followers').where('followerID', '=', userID)
}

const getDiscussionOwner = async (discussionID) => {
    const discussion = await knex.select('owner').from('Discussions').where('discussionID', '=', discussionID)
    return discussion[0].owner
}

const getFollowID = async (discussionID) => {
    const follow = await knex.select('userID').from('Followers').where('discussionID', '=', discussionID)
    return follow[0].userID
}

const getMessagesWaiting = async (userID) => {
    let discussionsMap = new Map()
    const discussions = await knex.select('discussionID', 'lastView').from('Participate').where('userID', '=', userID)

    if (discussions.length > 0) {
        for (const discussion of discussions) {
            let count = 0
            const messages = await knex.select('date').from('Messages').where('discussionID', '=', discussion.discussionID).where('userID', '!=', userID)

            for (const message of messages) {
                if (Date.parse(message.date) > Date.parse(discussion.lastView))
                    count++
            }
            
            discussionsMap.set(discussion.discussionID, count)
        }
    }

    return discussionsMap
}

const setDiscussionLastView = async (userID, discussionID, lastView) => {
    await knex('Participate').update('lastView', lastView).where('userID', '=', userID).where('discussionID', '=', discussionID)
}

const checkIfUserInDiscussion = async (userID, discussionID) => {
    return await knex.select('userID').from('Participate').where('userID', '=', userID).where(discussionID, '=', discussionID)
}

const getDiscussion = async userID => {
    return await knex.select('discussionID').from('Participate').where('userID', '=', userID)
}

const getFollowerDiscussionID = async (userID, followerID) => {
    return await knex.select('discussionID').from('Followers').where('userID', '=', userID).where('followerID', '=', followerID)
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion,
    getLastDiscussionByUserID, getDiscussionsByUserID, getMessagesByDiscussionID,
    getDiscussionUsersByDiscussionID, getDiscussionScrollPositionByUserIDAndByDiscussionID, getUsersFromName,
    getDiscussionsFromName, getDiscussionNumberOfParticipant, getAllDiscussions,
    setLastDiscussionByUserID, setDiscussionScrollPositionByUserIDAndByDiscussionID, createDiscussion,
    createDiscussionUser, insertFollower, joinDiscussion,
    getFollow, getDiscussionOwner, getFollowID,
    getMessagesWaiting, setDiscussionLastView, checkIfUserInDiscussion,
    getTopArtistsFromDB, getTopTrackFromDB, getUserFromDB,
    fillTopArtistInDatabase, fillTopTrackInDatabase, getOtherUsersFromDB,
    getFollowedUsers, getFollowersUsers, getDiscussion,
    getFollowerDiscussionID }