import { useEffect, useState } from 'react';
import { logoutCurrentUser } from '../scripts/user';
import { getFollowerUsers } from '../scripts/database';
import { catchErrors } from '../utils';
import { StyledButton, StyledLogoutButton } from '../styles';
import { SectionWrapper, UserGrid } from '../components';

const Follower = () => {
    const [followerUsers, setFollowerUsers] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const follower = await getFollowerUsers()
            setFollowerUsers(follower)
        }

        catchErrors(fetchData());
    }, [])

    return (
        <>
            <StyledButton href="/me">Home</StyledButton>
            <StyledLogoutButton onClick={logoutCurrentUser}>Se déconnecter</StyledLogoutButton>
            <main>
                <SectionWrapper title ="🥵 Follower">
                    {
                        followerUsers && (
                            <UserGrid users={followerUsers.userFollower}/>
                        )
                    }  
                </SectionWrapper>
            </main>

        </>

    )

}
export default Follower;