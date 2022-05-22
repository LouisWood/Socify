import { useState, useEffect } from 'react';
import { getCurrentUserPlaylists, logoutCurrentUser } from '../scripts/user';
import { SectionWrapper, PlaylistsGrid } from '../components';
import { catchErrors } from '../utils';
import { StyledButton, StyledLogoutButton } from '../styles';

const Playlists = () => {
    const [playlists, setPlaylists] = useState(null);

     /**
    * On crée une fct asynchrone pour ne pas rendre le hook useEffect asynchrone (sinon c'est le dawa)
    * https://github.com/facebook/react/issues/14326
    */
    useEffect(() => {
        const fetchData = async () => {
            const playslists = await getCurrentUserPlaylists();

            setPlaylists(playslists);
        };
        catchErrors(fetchData());
    },[])

    return (
        <>
            <StyledButton href="/">Home</StyledButton>
            <StyledLogoutButton onClick={logoutCurrentUser}>Se déconnecter</StyledLogoutButton>
            <main>
                <SectionWrapper title="🎧 Playlists" breadcrumb={true}>
                    {playlists && (
                        <PlaylistsGrid playlists={playlists.items}/>
                    )}
                </SectionWrapper>
            </main>
        </>
    )
}

export default Playlists;
