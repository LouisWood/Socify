import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { checkIfInDiscussion, checkIfFollowingUser, checkLastMessageDate, getCurrentUserLastDiscussion, getCurrentUserDiscussions, getCurrentUserDiscussionMessages, getDiscussionUsersStatus, getCurrentUserDiscussionScrollPosition, setCurrentUserLastDiscussion, setCurrentUserDiscussionScrollPosition,searchUsersAndDiscussions, followDiscussionUser, joinDiscussionUser, createDiscussion, getdiscussionsTrend, getCurrentUserFollow, getCurrentUserMessagesWaiting, setCurrentUserDiscussionLastView } from '../scripts/chat'
import { io } from 'socket.io-client'
import { useLocalStorage } from '../hook/localStorage'
import logo from '../images/socifyLogo.png'
import logoAdd from '../images/socifyAdd.png'
import socifyDefault from '../images/socifyDefault.png'
import '../styles/chat.css'
import { Modal, Form, Button } from 'react-bootstrap'

const Dashboard = () => {
    let typeDiscussion = false
    let lastMessage = null

    const [socket, setSocket] = useState(null)
    const [profile, setProfile] = useState(null)
    const [discussions, setDiscussions] = useState(null)
    const [messages, setMessages] = useState(null)
    const [currentDiscussion, setCurrentDiscussion] = useState(-1)
    const [inputValueMessage, setInputValueMessage] = useState('')
    const [inputValueSearch, setInputValueSearch] = useState('')
    const [follow, setFollow] = useState(null)
    const [show, setShow] = useState(false)
    const [discussionsTrend, setDiscussionsTrend] = useState(null)
    const [searchResult, setSearchResult] = useState(null)
    const [users, setUsers] = useState(null)
    const [messagesWaiting, setMessagesWaiting] = useState(null)
    const [errorName, setErrorName] = useState(null)
    const [errorPicture, setErrorPicture] = useState(null)

    const [scrollPosition, setScrollPosition] = useLocalStorage('scrollPosition', -1)

    const checkName = () => {
        const name = document.getElementById('discussionName').value
        let check = true

        if (name === '') {
            setErrorName('Vous devez fournir un nom')
            check = check && false
        } else {
            if (name.length > 20) {
                setErrorName('Le nom doit contenir 20 caractères au maximum')
                check = check && false
            } else {
                setErrorName(null)
            }
        }

        return check
    }

    const checkPicture = async () => {
        const picture = document.getElementById('discussionPicture').value
        let check = true

        if (picture === '') {
            setErrorPicture('Vous devez fournir un url')
            check = check && false
        } else {
            if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(picture)) {
                setErrorPicture(`L'url doit être une image`)
                check = check && false
            } else {
                const image = new Image()
                image.src = picture
                await image.decode()
                const width = image.width
                const height = image.height

                if (width !== height) {
                    setErrorPicture(`L'image doit être carré`)
                    check = check && false
                } else {
                    setErrorPicture(null)
                }
            }
        }

        return check
    }

    const handleClose = async (e, type) => {
        if (type) {
            e.preventDefault()
            e.stopPropagation()

            const nameChecked = checkName()
            const pictureChecked = checkPicture()

            if (nameChecked && pictureChecked) {
                const name = document.getElementById('discussionName').value
                const picture = document.getElementById('discussionPicture').value
                const discussion = await createDiscussion(name, picture)

                setShow(false)
                setErrorName(null)
                setErrorPicture(null)

                if (discussion) {
                    setDiscussions(await getCurrentUserDiscussions())
                    setMessages([])
                    setCurrentDiscussion(discussion)
                    await setCurrentUserLastDiscussion(discussion)

                    socket.emit('joinDiscussion', {
                        name: profile.display_name,
                        discussionID: discussion,
                        type: false
                    })
                    
                    setUsers(await getDiscussionUsersStatus(discussion))
                }
            }
        } else {
            setShow(false)
            setErrorName(null)
            setErrorPicture(null)
        }
    }

    const handleShow = () => setShow(true)

    const followUser = async (e, userID) => {
        e.preventDefault()

        const discussionID = await followDiscussionUser(userID)

        if (discussionID) {
            setDiscussions(await getCurrentUserDiscussions())
            setMessages(await getCurrentUserDiscussionMessages(discussionID))
            setCurrentDiscussion(discussionID)
            await setCurrentUserLastDiscussion(discussionID)

            socket.emit('joinDiscussion', {
                name: profile.display_name,
                discussionID: discussionID,
                type: false
            })
        }
    }

    const joinDiscussion = async (e, discussionID) => {
        e.preventDefault()

        await joinDiscussionUser(discussionID)

        setDiscussions(await getCurrentUserDiscussions())
        setMessages(await getCurrentUserDiscussionMessages(discussionID))
        setCurrentDiscussion(discussionID)
        await setCurrentUserLastDiscussion(discussionID)

        socket.emit('joinDiscussion', {
            name: profile.display_name,
            discussionID: discussionID,
            type: true
        })

        setUsers(await getDiscussionUsersStatus(discussionID))
    }

    const handleScroll = async e => {
        let element = e.target
        if (element.scrollHeight - element.scrollTop === element.clientHeight || element.scrollHeight > element.clientHeight) {
            setScrollPosition(-1)
            if (messagesWaiting.get(currentDiscussion) > 0) {
                await setCurrentUserDiscussionLastView(currentDiscussion, messages[messages.length - 1].rawDate)
                setMessagesWaiting(await getCurrentUserMessagesWaiting())
            }
        } else
            setScrollPosition(element.scrollTop)
    }

    const sendMessage = e => {
        e.preventDefault()

        if (inputValueMessage && profile) {
            socket.emit('sendMessage', {
                name: profile.display_name,
                discussionID: currentDiscussion,
                content: inputValueMessage
            })
            setInputValueMessage('')
        }
    }

    const search = async e => {
        e.preventDefault()
        
        if (inputValueSearch) {
            setSearchResult(await searchUsersAndDiscussions(inputValueSearch))
            setInputValueSearch('')
        } else
            setSearchResult(null)
    }

    const changeDiscussion = async (e, i) => {
        if ('active' in e.target.parentElement.classList)
            return
        
        document.querySelectorAll('ul.discussionsList button.active').forEach(item => {
            item.classList.remove('active')
        })

        e.target.parentElement.classList.add('active')

        if (currentDiscussion !== -1)
            await setCurrentUserDiscussionScrollPosition(currentDiscussion, scrollPosition)

        const index = i === -1 ? -1 : discussions[i].discussionID

        setMessages(index === -1 ? [] : await getCurrentUserDiscussionMessages(index))
        setCurrentDiscussion(index)
        setMessagesWaiting(await getCurrentUserMessagesWaiting())
        await setCurrentUserLastDiscussion(index)
        
        if (index !== -1) {
            setUsers(await getDiscussionUsersStatus(index))
            setScrollPosition(await getCurrentUserDiscussionScrollPosition(index))
        } else {
            setUsers([])
            setDiscussionsTrend(await getdiscussionsTrend())
            setSearchResult(null)
        }
    }

    useEffect(() => {
        if (socket === null)
            return

        const receiveMessage = async data => {
            if (currentDiscussion === data.discussionID) {
                setMessages((messages) => [...messages, data])
                await setCurrentUserDiscussionLastView(currentDiscussion, data.rawDate)
            } else {
                setMessagesWaiting(await getCurrentUserMessagesWaiting())
            }
        }
        
        socket.on('receiveMessage', receiveMessage)

        return () => socket.off('receiveMessage')
    }, [socket, currentDiscussion, messages])

    useEffect(() => {
        if (socket === null)
            return

        const receiveMessageDiscussion = async data => {
            setDiscussions(data.discussions)
            setMessagesWaiting(await getCurrentUserMessagesWaiting())
        }

        socket.on('receiveMessageDiscussion', receiveMessageDiscussion)

        return () => socket.off('receiveMessageDiscussion')
    }, [socket, discussions, messagesWaiting])

    useEffect(() => {
        if (socket === null)
            return

        const updateStatus = async (data) => {
            if (currentDiscussion === data.discussionID)
                setUsers(await getDiscussionUsersStatus(data.discussionID))
        }

        socket.on('updateStatus', updateStatus)

        return () => socket.off('updateStatus')
    }, [socket, currentDiscussion, users])

    useEffect(() => {
        const fetchData = async () => {
            const userSocket = io('http://localhost:8000', {withCredentials: true})
            setSocket(userSocket)

            setProfile(await getCurrentUserProfile())

            const userDiscussions = await getCurrentUserDiscussions()
            setDiscussions(userDiscussions)

            const userFollow = await getCurrentUserFollow()
            setFollow(userFollow)

            const userLastDiscussion = await getCurrentUserLastDiscussion()
            setCurrentDiscussion(userLastDiscussion)
            
            if (userDiscussions.length > 0) {
                userSocket.emit('initDiscussions')

                setMessagesWaiting(await getCurrentUserMessagesWaiting())
            }

            if (userLastDiscussion !== -1) {
                setMessages(await getCurrentUserDiscussionMessages(userLastDiscussion))

                setUsers(await getDiscussionUsersStatus(userLastDiscussion))

                setScrollPosition(await getCurrentUserDiscussionScrollPosition(userLastDiscussion))
            } else
                setDiscussionsTrend(await getdiscussionsTrend())
        }
        catchErrors(fetchData())
    }, [])

    const ScrollToBottom = () => {
        useEffect(() => {
            const element = document.getElementById('messagesList')
            element.scrollTop = element.scrollHeight
        })
        return <></>
    }

    const ScrollToPosition = () => {
        useEffect(() => {
            const element = document.getElementById('messagesList')
            element.scrollTop = scrollPosition
        })
        return <></>
    }

    const UpdateMessagesWaiting = () => {
        useEffect(() => {
            const fetchData = async () => {
                if (messages && messages.length > 0 && messages[messages.length - 1].discussionID === currentDiscussion)
                    await setCurrentUserDiscussionLastView(currentDiscussion, messages[messages.length - 1].rawDate)
            }
            catchErrors(fetchData())
        })
        return <></>
    }

    return (
        <div>
            <div className='homeLogo'>
                <img src={logo} alt='logo'/>
                <p>Socify</p>
            </div>

            <ul className='discussionsList'>
                {discussions && discussions.length > 0 && (
                    <>
                        {discussions.map((discussion, i) => {
                            if (discussion.discussionID === currentDiscussion)
                                typeDiscussion = discussion.owner !== ''
                            
                            return (
                                <li key={discussion.discussionID}>
                                    <button onClick={e => changeDiscussion(e, i)} className={discussion.discussionID === currentDiscussion ? 'active' : ''}>
                                        <img src={discussion.picture === '' ? socifyDefault : discussion.picture} alt='avatar' className='picture'/>
                                        <p className='name'>{discussion.name}</p>
                                        {messagesWaiting && messagesWaiting.get(discussion.discussionID) > 0 && discussion.discussionID !== currentDiscussion && (
                                            <p className='waiting'>{messagesWaiting.get(discussion.discussionID) > 9 ? '+9': messagesWaiting.get(discussion.discussionID)}</p>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </>
                )}
                
                <li key={-1}>
                    <button onClick={e => changeDiscussion(e, -1)} className={currentDiscussion === -1 ? 'active' : ''}>
                        <img src={logoAdd} alt='avatar' className='picture'/>
                        <p className='name'>Ajouter</p>
                    </button>
                </li>
            </ul>

            <div className='userInfo'>
                {profile && (
                    <>
                        <a href='/me'><img src={profile.images.length > 0 ? profile.images[0].url : socifyDefault} alt='Avatar' className='picture'/></a>
                        <a href='/me' className='name'>{profile.display_name}</a>
                    </>
                )}
            </div>

            {currentDiscussion !== -1 ?
                <>
                    {messagesWaiting && messagesWaiting.get(currentDiscussion) > 0 && scrollPosition === -1 && (
                        <>
                            <UpdateMessagesWaiting/>
                        </>
                    )}
                    <div className={typeDiscussion ? 'messagesList' : 'messagesListFollow'} onScroll={handleScroll} id='messagesList'>
                        <ul>
                            {messages && (
                                <>
                                    {messages.map((message, i) => {
                                        let type = false
                                        if (lastMessage) {
                                            type = checkLastMessageDate(message, lastMessage)
                                        }

                                        lastMessage = message

                                        return (
                                            <li key={i}>
                                                {type ?
                                                    <>
                                                        <p className='dateMin'>{message.dateMin}</p>
                                                        <p className='contentMin'>{message.content}</p>
                                                    </>
                                                :
                                                    <>                                                        
                                                        <a href={profile.id === message.userID ? '/me' : `/user/${message.userID}`}><img src={message.picture === '' ? socifyDefault : message.picture} alt='avatar' className='picture'/></a>
                                                        <a href={profile.id === message.userID ? '/me' : `/user/${message.userID}`} className='name'>{message.name}</a>
                                                        <p className='date'>{message.date}</p>
                                                        <p className='content'>{message.content}</p>
                                                    </>
                                                }
                                            </li>
                                        )
                                    })}
                                    {scrollPosition === -1 ? <ScrollToBottom/> : <ScrollToPosition/>}
                                </>
                            )}
                        </ul>
                    </div>

                    
                    <div className={typeDiscussion ? 'sendMessage' : 'sendMessageFollow'}>
                        <input type='text' placeholder='Tapez votre message ici' className='sendMessageInput' value={inputValueMessage} onChange={e => setInputValueMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}/>
                        <button className='sendMessageButton' onClick={sendMessage}>Envoyer</button>
                    </div>
                    
                    {typeDiscussion && (
                        <div className='usersList' id='usersList'>
                            {users && (
                                <ul>
                                    {users.connected && users.connected.length > 0 && (
                                        <>
                                            <p className='usersStatus'>{`En ligne - ${users.connected.length}`}</p>
                                            {users.connected.map((user, i) => (
                                                <li key={i}>
                                                    <a href={profile.id === user.userID ? '/me' : `/user/${user.userID}`}><img src={user.picture === '' ? socifyDefault : user.picture} alt='avatar' className='picture'/></a>
                                                    <a href={profile.id === user.userID ? '/me' : `/user/${user.userID}`} className='name'>{user.name}</a>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                    {users.disconnected && users.disconnected.length > 0 && (
                                        <>
                                            <p className='usersStatus'>{`Hors ligne - ${users.disconnected.length}`}</p>
                                            {users.disconnected.map((user, i) => (
                                                <li key={i}>
                                                    <a href={profile.id === user.userID ? '/me' : `/user/${user.userID}`}><img src={user.picture === '' ? socifyDefault : user.picture} alt='avatar' className='picture'/></a>
                                                    <a href={profile.id === user.userID ? '/me' : `/user/${user.userID}`} className='name'>{user.name}</a>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                </>
            :
                <>
                    <button className='createDiscussion' onClick={handleShow}>Créer une discussion</button>
                    <div className='trendDiscussion'>
                        <p className='title'>Discussions en tendances</p>
                        {discussionsTrend && discussionsTrend.length > 0 ?
                            <ul className='discussionsTrend'>
                                {discussionsTrend.map((discussion, i) => (
                                    <li key={i}>
                                        <img src={discussion.picture === '' ? socifyDefault : discussion.picture} alt='avatar' className='picture'/>
                                        <p className='name'>{discussion.name}</p>
                                        {checkIfInDiscussion(discussions, discussion.discussionID) ?
                                            <button className='rejoint'>Rejoint</button>
                                        :
                                            <button className='button' onClick={e => joinDiscussion(e, discussion.discussionID)}>Rejoindre</button>
                                        }
                                        <p className='online'>{`En ligne : ${discussion.online}`}</p>
                                        <p className='members'>{`Membres : ${discussion.members}`}</p>
                                    </li>
                                ))}
                            </ul>
                        :
                            <p className='title'>Aucune discussion en tendance</p>
                        }
                    </div>
                    <div className='exploreDiscussion'>
                        <p className='title'>Explorez la communauté</p>
                        <p className='titleDescription'>Recherchez une discussion ou une personne.</p>
                        <div className='searchDiscussion'>
                            <input type='text' className='searchInput' placeholder='Que recherchez vous ?' value={inputValueSearch} onChange={e => setInputValueSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' ? search(e) : null}/>
                            <button type='submit' className='searchButton' onClick={search}><i className='fa fa-search'/></button>
                        </div>
                        <ul></ul>
                        <div className='searchResult'>
                            {searchResult && (
                                <>
                                    {(searchResult.users.length > 0 || searchResult.discussions.length > 0) ?
                                        <>
                                            <div className='searchLeft'>
                                                <p className='title titleLeft'>{`Utilisateurs - ${searchResult.users.length}`}</p>
                                                {searchResult.users.length > 0 && (
                                                    <ul className='userResult'>
                                                        {searchResult.users.map((user, i) => (
                                                            <li key={i}>
                                                                <img src={user.picture === '' ? socifyDefault : user.picture} alt='avatar' className='picture'/>
                                                                <p className='name'>{user.name}</p>
                                                                {checkIfFollowingUser(follow, user.userID) ?
                                                                    <button className='suit'>Suit</button>
                                                                :
                                                                    <button className='button' onClick={e => followUser(e, user.userID)}>Suivre</button>
                                                                }
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className='searchRight'>
                                                <p className='title titleRight'>{`Discussions - ${searchResult.discussions.length}`}</p>
                                                {searchResult.discussions.length > 0 && (
                                                    <ul className='discussionResult'>
                                                        {searchResult.discussions.map((discussion, i) => (
                                                            <li key={i}>
                                                                <img src={discussion.picture === '' ? socifyDefault : discussion.picture} alt='avatar' className='picture'/>
                                                                <p className='name'>{discussion.name}</p>
                                                                {checkIfInDiscussion(discussions, discussion.discussionID) ?
                                                                    <button className='rejoint'>Rejoint</button>
                                                                :
                                                                    <button className='button' onClick={e => joinDiscussion(e, discussion.discussionID)}>Rejoindre</button>
                                                                }
                                                                <p className='online'>{`En ligne : ${discussion.online}`}</p>
                                                                <p className='members'>{`Membres : ${discussion.members}`}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </>
                                    :
                                        <p className='title titleMiddle'>{`Aucun résultat pour "${searchResult.name}"`}</p>
                                    }
                                </>
                            )}
                        </div>
                    </div>

                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{color: '#000'}}>Créer une discussion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form id='form'>
                                <Form.Group className='mb-3' controlId='discussionName'>
                                    <Form.Label style={{color: '#000'}}>Nom</Form.Label>
                                    <Form.Control type='text' autoFocus isInvalid={errorName !== null} onChange={checkName}/>
                                    <Form.Control.Feedback type="invalid">{errorName}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className='mb-3' controlId='discussionPicture'>
                                    <Form.Label style={{color: '#000'}}>Image (url)</Form.Label>
                                    <Form.Control type='text' isInvalid={errorPicture !== null} onChange={checkPicture}/>
                                    <Form.Control.Feedback type="invalid">{errorPicture}</Form.Control.Feedback>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='secondary' onClick={(e) => handleClose(e, false)}>Fermer</Button>
                            <Button variant='primary' onClick={(e) => handleClose(e, true)}>Créer la discussion</Button>
                        </Modal.Footer>
                    </Modal>
                </>
            }
        </div>
    )
}

export default Dashboard