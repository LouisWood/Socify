import styled from "styled-components/macro";


const StyledPlaylistGenContainer = styled.main`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: 50;

button {
    background-color: var(--green);
    color: white;
    border-radius: var(--border-radius-pill);
    font-weight: 600;
    font-size: var(--fsize-lg);
    padding: var(--spacing-sm) var(--spacing-xl);
    &:hover, &:focus {
        text-decoration: none;
        filter: brightness(1.1);
        }
    }
}
`;

export default StyledPlaylistGenContainer;