/**
 * Component qui se charge du rendu des artistes
 */
 import {StyledGrid} from '../styles';

 const ArtistGrid = ({artists}) => {
     
     return(
     <>
         {artists[0] && artists[0].length ? (
             <>
             <StyledGrid type='artist'>
                 {artists.map((artist, i) => (
                        <li className='grid_item' key={i} >
                        <a href={'https://open.spotify.com/artist/'+artist[0].artistID} target='_blank' key={i}>
                            <div className='grid_item_inner'>
                                {artist[0].image && (
                                        <div className='grid_item_img'>
                                            <img src={artist[0].image} alt={artist[0].name}/>
                                        </div>
                                    )
                                }
                                <h3 className='grid_item_name overflow-ellipsis'>{artist[0].name}</h3>
                                <p className='grid_item_label'>Artiste</p>
                            </div>
                        </a>
                    </li>
                 ))}
             </StyledGrid>
             </>
         ) : (
             <p className='empty-notice'>Pas d'artistes à afficher 😔</p>
         )}
     </>
 )};
 
 export default ArtistGrid;