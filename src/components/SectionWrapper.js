/**
 * Component pour toutes les sections
 */
 import {Link} from "react-router-dom";
 import {StyledSection} from '../styles';
 
 const SectionWrapper = ({children, title, seeAllLink, breadCrumb}) => (
     <StyledSection>
         <div className='section_inner'>
             <div className='section_top'>
                 <h2 className='section_heading'>
                     {
                         breadCrumb && (
                             <span className='section_breadcrumb'>
                                 <Link to='/'>Profile</Link>
                             </span>
                         )
                     }
                     {
                         title && (
                             <>
                                 {seeAllLink ? (
                                     <Link to={seeAllLink}>{title}</Link>
                                 ) : (
                                     <span>{title}</span>
                                 )}
                             </>
                         )
                     }
                 </h2>
                 {
                     seeAllLink && (
                         <Link to={seeAllLink} className='section_see-all'>Voir tout</Link>
                     )
                 }
             </div>
             {children}
         </div>
     </StyledSection>
 );
 
 export default SectionWrapper;