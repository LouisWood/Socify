import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { logoutCurrentUser } from '../scripts/user';
import { getUser, getUserTArtist, getUserTTrack} from '../scripts/database';
import { getTracksAverageStats } from '../scripts/music';
import { StyledHeader, StyledButton, StyledLogoutButton } from '../styles';
import { SectionWrapper, ArtistGrid, TrackList, StatGrid } from '../components';
import { catchErrors } from '../utils';
import socifyDefault from '../images/socifyDefault.png'

const OtherUser = () => {
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null)
    const [tArtist, setTArtist] = useState(null);
    const [tTrack, setTTrack] = useState(null);

    const {userID} = useParams();

    useEffect(() => {
        /**
        * On crée une fct asynchrone pour ne pas rendre le hook useEffect asynchrone (sinon c'est le dawa)
        * https://github.com/facebook/react/issues/14326
        */
        const fetchData = async () => {
            const userInf = await getUser(userID)
            setUser(userInf)
            
            const userTArtist = await getUserTArtist(userID)
            setTArtist(userTArtist)

            const userTTrack = await getUserTTrack(userID)
            setTTrack(userTTrack)

            if (userTTrack) {
                const userStats = await getTracksAverageStats(userTTrack);
                setStats(userStats);
            } else
                setStats(null);
        };
        catchErrors(fetchData());
    }, []);

    return (
        <>
            <StyledButton href="/dashboard">Rooms</StyledButton>
            <StyledLogoutButton onClick={logoutCurrentUser}>Se déconnecter</StyledLogoutButton>
            {user && (
                <>
                    <StyledHeader type="user">
                        <div className="header_inner">
                            {user.picture && (
                                <img className="header_img" src={user.picture === "" ? socifyDefault : user.picture} alt="Avatar"/>
                            )}
                            <div>
                                <div className="header_overline">Profil</div>
                                <h1 className="header_name">{user.name}</h1>
                            </div>
                        </div>
                    </StyledHeader>
                    {
                        tArtist && tTrack && (
                            <main>
                                <SectionWrapper title="📊 Stats">
                                    <StatGrid stats={stats}/>
                                </SectionWrapper>
                                <SectionWrapper title="🔥 Artistes du mois" seeAllLink={"/top-artists/"+userID}>
                                    <ArtistGrid artists={tArtist.slice(0, 5)}/>
                                </SectionWrapper>
                                <SectionWrapper title="🔥 Sons du mois" seeAllLink={"/top-tracks/"+userID}>
                                    <TrackList tracks={tTrack.slice(0, 5)}/>
                                </SectionWrapper>
                            </main>
                        )
                    }
                </>
            )}
        </>
    )
};

export default OtherUser;