import axios from 'axios'

export const checkIfInDiscussion = (discussions, find) => {
    let found = false

    if (discussions.length > 0) {
        for (const discussion of discussions) {
            if (discussion.discussionID === find) {
                found = true
                break
            }
        }
    }

    return found
}

export const checkIfFollowingUser = (follow, find) => {
    let found = false

    if (follow.length > 0) {
        for (const user of follow) {
            if (user.userID === find) {
                found = true
                break
            }
        }
    }

    return found
}

export const checkLastMessageDate = (message, lastMessage) => {
    const date = new Date(message.rawDate)
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const oldDate = new Date(lastMessage.rawDate)
    const oldYear = oldDate.getFullYear()
    const oldMonth = oldDate.getMonth()
    const oldDay = oldDate.getDate()
    const oldHours = oldDate.getHours()
    const oldMinutes = oldDate.getMinutes()

    return (message.userID === lastMessage.userID && year === oldYear && month === oldMonth && day === oldDay && hours === oldHours && (minutes - 11) < oldMinutes) ? true : false
}

export const getCurrentUserLastDiscussion = async () => {
    const response = await axios.get('/lastDiscussion')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussions = async () => {
    const response = await axios.get('/discussions')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussionMessages = async discussionID => {
    const response = await axios.post('/messages', {
        discussionID: discussionID
    })
    return 'res' in response.data ? response.data.res : null
}

export const getDiscussionUsersStatus = async discussionID => {
    const response = await axios.post('/usersStatus', {
        discussionID: discussionID
    })
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussionScrollPosition = async discussionID => {
    const response = await axios.post('/lastScrollPosition', {
        discussionID: discussionID,
    })
    return 'res' in response.data ? response.data.res : null
}

export const setCurrentUserLastDiscussion = async lastDiscussion => {
    await axios.post('/lastDiscussion', {
        lastDiscussion: lastDiscussion
    })
}

export const setCurrentUserDiscussionScrollPosition = async (discussionID, scrollPosition) => {
    await axios.post('/scrollPosition', {
        discussionID: discussionID,
        scrollPosition: scrollPosition
    })
}

export const searchUsersAndDiscussions = async name => {
    const response = await axios.post('/search', {
        name: name
    })
    return 'res' in response.data ? response.data.res : null
}

export const followDiscussionUser = async (userID) => {
    const response = await axios.post('/followUser', {
        userID: userID
    })
    return 'res' in response.data ? response.data.res : null
}

export const joinDiscussionUser = async discussionID => {
    await axios.post('/joinDiscussion', {
        discussionID: discussionID
    })
}

export const createDiscussion = async (name, picture) => {
    const response = await axios.post('/createDiscussion', {
        name: name,
        picture: picture
    })
    return 'res' in response.data ? response.data.res : null
}

export const getdiscussionsTrend = async () => {
    const response = await axios.get('/discussionsTrend')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserFollow = async () => {
    const response = await axios.get('/follow')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserMessagesWaiting = async () => {
    const response = await axios.get('/messagesWaiting')
    return 'res' in response.data ? new Map(response.data.res) : null
}

export const setCurrentUserDiscussionLastView = async (discussionID, lastView) => {
    await axios.post('/lastView', {
        discussionID: discussionID,
        lastView: lastView
    })
}