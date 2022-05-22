import { StyledPlaylistGenContainer } from "../styles";
import { setCurrentUserPlaylist, fillCurrentUserPlaylist } from '../scripts/user';
import { getArtistTopTracks } from '../scripts/music'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const PlaylistGenButton = ({items, type, profile, range}) => {
    return (
        <>
            <StyledPlaylistGenContainer>
                <button onClick={()=> pushPlaylist(type, items, profile, range)}>
                    Générer Playlist
                </button>
            </StyledPlaylistGenContainer>
            <ToastContainer autoClose={3000}/>
        </>
    )
}

/**
 * Genere une playlist contenant les 5 sons les plus écoutés des top artistes du user 'profile' selon le 'range' spécifié dans la page
 * @param {*} profile 
 * @param {*} items 
 * @returns 
 */
const GenereatePlaylistFromArtist = async (profile, items) => {
    let tracksUris = [];
    let playlistName = `${profile.name} top artistes 🔥`;
    let playlistDesc = `Les 5 top sons des 20 artistes préferés de ${profile.name}`; 

    for(let i=0; i<items.length; i++) {
        const tracks = await getArtistTopTracks((items[i])[0].artistID);
        if (tracks) {
            const topTracks = tracks.tracks.slice(0, 5);

            for (const topTrack of topTracks) 
                tracksUris.push(topTrack.uri)
        }
    }

    return {playlistName, playlistDesc, tracksUris}
}

/**
 * Genere une playlist contenant les sons les plus écoutés du user 'profile' selon le 'range' spécifié dans la page
 * @param {*} items 
 * @param {*} profile 
 * @param {*} range 
 */
const GenereatePlaylistFromTrack = async (profile, items) => {
    const tracksUris = [];
    let playlistName = `${profile.name} top sons 🔥`;
    let playlistDesc = `Les 20 sons les plus écoutés de ${profile.name}`; 
    
    for(let i=0; i<items.length; i++) {
        tracksUris.push((items[0])[0].uri)
    }
    return {playlistName, playlistDesc, tracksUris}
}

/**
 * Push de la playlist génerée par GenereatePlaylistFromArtist OU GenereatePlaylistFromTrack
 * @param {*} type 
 * @param {*} items 
 * @param {*} profile 
 * @param {*} range 
 */
const pushPlaylist = async (type, items, profile, range) => {
    let {playlistName, playlistDesc, tracksUris} = (type === 'artists') ? 
        await GenereatePlaylistFromArtist(profile, items) : 
        await GenereatePlaylistFromTrack(profile, items); 
    const month = ["Janvier", "Fevrier", "Mars", 
                  "Avril", "Mai", "Juin", 
                  "Juillet", "Aout", "Septembre", 
                  "Octobre", "Novembre", "Decembre"];
    const dateNow = new Date();

    switch (range) {
        case 'short':
            playlistName += `(${month[dateNow.getMonth()]} ${dateNow.getFullYear()})`;
            playlistDesc += ` durant ces 4 dernières semaines. Playlist générée par Socify ©`;
            break;

        case 'medium':
            playlistName += `(${month[(((dateNow.getMonth() - 5) % 12) + 12) % 12] } - ${month[dateNow.getMonth()]} ${dateNow.getFullYear()})`;
            playlistDesc += ` durant ces 6 derniers month. Playlist générée par Socify ©`;
            break;
        
            case 'long':
                playlistName += '(all time)';
                playlistDesc += '. Playlist générée par Socify ©';
                break;
        default:
            break;
    }

    const playlist = await setCurrentUserPlaylist(playlistName, playlistDesc);
    
    if (playlist) {
        const {dataTracks} = await fillCurrentUserPlaylist(playlist.id, tracksUris);
        toast.success("✨ Playlist générée ✨", {delay: 0, theme: "dark"});
    } else {
        toast.error("Erreur lors de la génération", {delay: 0, theme: "dark"});
    }
}


export default PlaylistGenButton;