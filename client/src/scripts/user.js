import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

export const getCurrentUserProfile = async () => {
    const response = await axios.get('/me')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserPlaylists = async () => {
    const response = await axios.get('/me/playlists')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserTopArtists = async (time_range) => {
    const response = await axios.post('/me/top/artists', {
        time_range: time_range
    })
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserTopTracks = async (time_range) => {
    const response = await axios.post('/me/top/tracks', {
        time_range: time_range
    })
    return 'res' in response.data ? response.data.res : null
}

export const setCurrentUserPlaylist = async (playlistName, playlistDesc) => {
    const response = await axios.post('/users/me/playlists', {
        playlistName: playlistName,
        playlistDesc: playlistDesc
    })
    return 'res' in response.data ? response.data.res : null
}

export const fillCurrentUserPlaylist = async (playlistID, tracksUris) => {
    const response = await axios.post('/playlists/playlistID/tracks', {
        playlistID: playlistID,
        tracksUris: tracksUris
    })
    return 'res' in response.data ? response.data.res : null
}

export const logoutCurrentUser = async () => {
    const windowLogout = window.open('https://spotify.com/logout', 'Déconnexion de Spotify', 'width=400,height=600, resizable=0')
  
    setTimeout(function() {
        windowLogout.close()
    }, 1000)

    await axios.get('/logout')
    
    setTimeout(function() {
        window.location.href = '/'
    }, 1000)
}
