import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

/**
 * Calculer la moyenne des éléments d'un tableau
 * https://poopcode.com/calculate-the-average-of-an-array-of-numbers-in-javascript/
 * @param {} arr 
 * @returns 
 */
const average = arr => 
    arr.reduce((a,b) => a + b, 0) / arr.length

export const getTracksAverageStats = async (tracks) => {
    let tabAcousticness = []
    let tabDanceability = []
    let tabEnergy = []
    let tabInstrumentalness = []
    let tabValence = []
    let averageStats = new Map() 

    for (const track of tracks) {
        const infoTrack = await getTracksInfo(track[0].trackID)
        
        if (infoTrack) {
            tabAcousticness.push(infoTrack.acousticness)
            tabDanceability.push(infoTrack.danceability)
            tabEnergy.push(infoTrack.energy)
            tabInstrumentalness.push(infoTrack.instrumentalness)
            tabValence.push(infoTrack.valence)
        }
    }

    averageStats.set('Acoustique', (tabAcousticness.length !== 0) ?  parseInt(average(tabAcousticness) * 100)  + '%' : '0%')
    averageStats.set('Dansabilité', (tabDanceability.length !== 0)  ? parseInt(average(tabDanceability) * 100)  + '%' : '0%')
    averageStats.set('Énergie',  (tabEnergy.length !== 0) ? parseInt(average(tabEnergy) * 100)  + '%' : '0%')
    averageStats.set('Instrumentalité', (tabInstrumentalness.length !== 0) ? parseInt(average(tabInstrumentalness) * 100) + '%' : '0%')
    averageStats.set('Valence', (tabValence.length !== 0) ? parseInt(average(tabValence) * 100) + '%' : '0%')
    
    return averageStats
}

export const getArtistTopTracks = async (artistID) => {
    const response = await axios.post('/artists/artistID/top-tracks', {
        artistID: artistID
    })
    return 'res' in response.data ? response.data.res : null
}

export const getTracksInfo = async (trackID) => {
    const response = await axios.post('/audio-features/trackID', {
        trackID: trackID
    })
    return 'res' in response.data ? response.data.res : null
}

export const getPlaylistByID = async (playlistID) => {
    const response = await axios.post('/playlists/playlistID', {
        playlistID: playlistID
    })
    return 'res' in response.data ? response.data.res : null
}