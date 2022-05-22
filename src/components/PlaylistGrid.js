import { Link } from "react-router-dom";
import { StyledGrid } from "../styles";

const PlaylistsGrid = ({playlists}) => (
    <>
        {playlists && playlists.length ? (
            <StyledGrid>
                {playlists.map((playlist, i) => (
                    <li className='grid_item' key={i}>
                        <Link className='grid_item_inner'to={`/playlists/${playlist.id}`}>
                            {playlist.images[0] && (
                                <div className='grid_item_img'>
                                    <img src={playlist.images[0].url} alt={playlist.name}/>
                                </div>
                            )}
                            <h3 className='grid_item_name overflow-ellipsis'>{playlist.name}</h3>
                            <p className='grid_item_label'>Playlist</p>
                        </Link>
                    </li>
                ))}
            </StyledGrid>
        ): (
            <p className='empty-notice'>Pas de playlist à afficher 😔</p>
        )}
    </>
);

export default PlaylistsGrid;