/**
 * Component qui se charge du rendu des tracks
 */
import {msToMinScnd} from '../utils';
import {StyledTrackList} from '../styles';

const PlaylistTrackList = ({tracks}) => (
    <>
        {tracks && tracks.length ? (
            <StyledTrackList>
                {tracks.map((track, i) => (
                <li className='track_item' key={i}>
                    <div className='track_item_num'>{i+1}</div>
                    <div className='track_item_title-group'>
                        {track.album.images.length && track.album.images[2] && (
                            <div className='track_item_img'>
                                <img src={track.album.images[2].url} alt={track.name}/>
                            </div>
                        )}
                        <div className="track_item_name-artist">
                            <div className="track_item_name overflow-ellipsis">
                                {track.name}
                            </div>
                            <div className='track_item_artist overflow-ellipsis'>
                                {track.artists.map((artist, i) => (
                                    <span key={i}>
                                        {artist.name}{i !== track.artists.length -1 && ', '}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='track_item_album overflow-ellipsis'>
                        {track.album.name}
                    </div>
                    <div className="track_item_duration">
                        {msToMinScnd(track.duration_ms)}
                    </div>
                </li>
                ))}
            </StyledTrackList>
        ) : (
            <p className='empty-notice'>No tracks</p>
        )} 
    </>
)

export default PlaylistTrackList;