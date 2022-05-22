import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

export const getCurrentUser = async () => {
    const response = await axios.get('bd/me/user')
    return response.data
}

export const getCurrentUserTArtist = async (time_range) => {
    const response = await axios.get('/bd/me/top/artist', {
        params : {
            time_range: time_range
        }
    })
    return response.data
}

export const getCurrentUserTTrack = async (time_range) => {
    const response = await axios.get('/bd/me/top/track', {
        params: {
            time_range: time_range
        }
    })
    return response.data
}

export const getUser = async (userID) => {
    const response = await axios.get('bd/user', {
        params: {
            userID: userID
        }
    })
    return response.data
}

export const getUserTArtist = async (userID, time_range) => {
    const response = await axios.get('/bd/top/artist', {
        params : {
            userID: userID,
            time_range: time_range
        }
    })
    return response.data
}

export const getUserTTrack = async (userID, time_range) => {
    const response = await axios.get('bd/top/track', {
        params: {
            userID: userID,
            time_range: time_range
        }
    })
    return response.data
}

export const getOtherUsers = async () => {
    const response = await axios.get('/bd/others')
    return response.data
}

export const getFollowedUsers = async () => {
    const response = await axios.get('/bd/followed')
    return response.data
}

export const getFollowerUsers = async () => {
    const response = await axios.get('/bd/follower')
    return response.data
} 
