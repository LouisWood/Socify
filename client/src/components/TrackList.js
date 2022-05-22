/**
 * Component qui se charge du rendu des tracks
 */
 import {msToMinScnd} from '../utils';
 import {StyledTrackList} from '../styles';
 
 const TrackList = ({tracks}) => {
     return (
     <>
         {tracks[0] && tracks[0].length ? (
             <StyledTrackList>
                 {tracks.map((track, i) => (
                 <li className='track_item' key={i}>
                     <div className='track_item_num'>{i+1}</div>
                     <div className='track_item_title-group'>
                         {track[0].image && (
                             <div className='track_item_img'>
                                 <img src={track[0].image} alt={track[0].name}/>
                             </div>
                         )}
                         <div className="track_item_name-artist">
                             <div className="track_item_name overflow-ellipsis">
                                 {track[0].name}
                             </div>
                             <div className='track_item_artist overflow-ellipsis'>
                                     <span key={i}>
                                         {track[0].artistName}
                                     </span>
                                 
                             </div>
                         </div>
                     </div>
                     <div className='track_item_album overflow-ellipsis'>
                         {track[0].albumName}
                     </div>
                     <div className="track_item_duration">
                         {msToMinScnd(track[0].duration)}
                     </div>
                 </li>
                 ))}
             </StyledTrackList>
         ) : (
             <p className='empty-notice'>Pas de titre à afficher 😔</p>
         )} 
     </>
 )}
 
 export default TrackList;