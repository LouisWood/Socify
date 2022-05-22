/**
 * Page de login
 * Attention a bien utiliser la convention PascalCase
 * https://techterms.com/definition/pascalcase
 */
import styled from 'styled-components/macro';

/**
 * Pour centrer le bouton en utilisant Flexbox
 * https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
const StyledLoginContainer = styled.main`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 50;
`;
 
/**
 * Pour postionner le title en utilisant Flexbox
 * https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
const StyledTitleContainer = styled.main`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
 
/**
 * Bouton de Login
 */
const StyledLoginButton = styled.a`
    display: inline-block;
    background-color: var(--green);
    color: white;
    border-radius: var(--border-radius-pill);
    font-weight: 600;
    font-size: var(--fsize-lg);
    padding: var(--spacing-sm) var(--spacing-xl);

    &:hover, &:focus {
        text-decoration: none;
        filter: brightness(1.1);
        color: white;
    }
`;
 
/**
 * Title de l'app
 */
const StyledTitleHeader = styled.h1`
    font-weight: 500;
    font-size: var(--fsize-title);
`
 
const Login = () => (
    <>
        <StyledTitleContainer>
            <StyledTitleHeader>Socify</StyledTitleHeader>
        </StyledTitleContainer>
        <StyledLoginContainer>
            <StyledLoginButton href='http://localhost:8000/login'>Login to Spotify</StyledLoginButton>
        </StyledLoginContainer>
    </>
);

export default Login;