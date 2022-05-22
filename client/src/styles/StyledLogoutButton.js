import styled from 'styled-components/macro';

const StyledLogoutButton = styled.button`
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(0,0,0,.7);
    color: var(--white);
    font-size: var(--fsize-sm);
    font-weight: 700;
    border-radius: var(--border-radius-pill);
    z-index: 10;
    @media (min-width: 768px) {
        right: var(--spacing-lg);
    }
    &:hover, &:focus {
        text-decoration: none;
        color: white;
        background-color: rgba(40,40,40,.7);
    }
`;

export default StyledLogoutButton