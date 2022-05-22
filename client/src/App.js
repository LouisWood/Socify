import { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
    Navigate
} from 'react-router-dom'
import { GlobalStyle } from './styles';
import { Login, Profile, OtherUser, TopArtists, TopTracks, Playlists, Playlist, Dashboard, Users, Followed, Follower } from './pages';


/**
 * Forcer les pages à s'afficher à partir du haut
 * (le comportement de base fait qu'elle s'affiche en étant tout en bas)
 * https://www.kindacode.com/article/react-router-dom-scroll-to-top-on-route-change/
 * @returns null
 */
function ScrollToTop() {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo(0,0);
    }, [pathname]);

    return null;
}

function App() {
    const [token, setToken] = useState(false);

    useEffect(() => {
        setToken(document.cookie.indexOf('userID=') !== -1 ? true : false);
    }, []);

    /**
     * Setup React Routes avec react-router-dom
     * https://stackoverflow.com/questions/69975792/error-home-is-not-a-route-component-all-component-children-of-routes-mus
     */
    return (
        <div className="App">
            <GlobalStyle/>
            <header className="App-header">
                {!token ? (
                    <Login/>
                ) : (
                    <>
                        <Router>
                            <ScrollToTop />
                            <Routes>
                                <Route path="/top-artists/:userID" element={<TopArtists/>} />
                                <Route path="/top-tracks/:userID" element={<TopTracks/>} />
                                <Route path="/playlists/:id" element={<Playlist/>} />
                                <Route path="/playlists" element={<Playlists/>} />
                                <Route path="/dashboard" element={<Dashboard/>}/>
                                <Route path='/me' element={<Profile/>}/>
                                <Route path='/user/:userID' element={<OtherUser/>}/>
                                <Route path="/users" element={<Users/>}/>
                                <Route path="/followed" element={<Followed/>}/>
                                <Route path="/follower" element={<Follower/>}/>
                                <Route path="/" element={<Navigate replace to="/me"/>}/>
                                <Route path="*" element={<Navigate replace to="/"/>}/>
                            </Routes>
                        </Router>
                    </>)
                }
            </header>
        </div>
    );
}

export default App;
