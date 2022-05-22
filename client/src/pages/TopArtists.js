import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { logoutCurrentUser } from '../scripts/user';
import { getUser, getUserTArtist } from '../scripts/database';
import { ArtistGrid, SectionWrapper, RangeButton, PlaylistGenButton } from '../components';
import { catchErrors } from '../utils';
import { StyledButton, StyledLogoutButton } from '../styles';

const TopArtists = () => {
    const {userID} = useParams();
    const [activeRange, setActiveRange] = useState('short');

    const [user, setUser] = useState(null)
    const [tArtist, setTArtist] = useState(null);

    useEffect (() => {
         /**
        * On crée une fct asynchrone pour ne pas rendre le hook useEffect asynchrone (sinon c'est le dawa)
        * https://github.com/facebook/react/issues/14326
        */
        const fetchData = async () => {

            const userInf = await getUser(userID)
            setUser(userInf)
            
            const userTArtist = await getUserTArtist(userID, `${activeRange}_term`)
            setTArtist(userTArtist)
        };
        catchErrors(fetchData());
    }, [activeRange, userID]);
    let j = 0
    if(tArtist) {
        
        for(j=0; j < tArtist.length ; j++) {
            if(!(tArtist[j])[0])
                break;
        }
    }
    return (
        <>
            <StyledButton href="/me">Home</StyledButton>
            <StyledLogoutButton onClick={logoutCurrentUser}>Se déconnecter</StyledLogoutButton>
            <main>
                { user && (
                    <SectionWrapper title={`🚀 ${user.name} Top Artistes`} breadcrumb={true}>
                        <RangeButton activeRange={activeRange} setActiveRange={setActiveRange}/>
                        { tArtist && (<ArtistGrid artists={tArtist.slice(0, j)}/>) }
                    </SectionWrapper>
                )

                }
                {tArtist && user && (
                    <PlaylistGenButton items={tArtist.slice(0, j)} type={'artists'} profile={user} range={activeRange}/>)}
            </main>
        </>
        
    );
};

export default TopArtists;