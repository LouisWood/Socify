/**
 * Component qui se charge du rendu des artistes
 */
 import {StyledGrid} from '../styles';
 import { Link } from "react-router-dom";
 import socifyDefault from '../images/socifyDefault.png'

 const UserGrid = ({users}) => (
     <>
         {users && users.length ? (
             <>
             <StyledGrid type='artist'>
                 {users.map((user, i) => (
                    <li className='grid_item' key={i} >
                        <Link className='grid_item_inner'to={`/user/${user.userID}`} target='_blank'>
                            <div className='grid_item_inner'>
                                <div className='grid_item_img'>
                                    <img src={user.picture === "" ? socifyDefault : user.picture} alt={user.name}/>
                                </div>
                                <h3 className='grid_item_name overflow-ellipsis'>{user.name}</h3>
                                <p className='grid_item_label'>Utilisateur</p>
                            </div>
                        </Link>
                    </li>
                 ))}
             </StyledGrid>

             </>
         ) : (
             <p className='empty-notice'>Pas d'utilisateurs à afficher 😔</p>
         )}
     </>
 );
 
 export default UserGrid;