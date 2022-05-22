import { createGlobalStyle } from "styled-components/macro";
import variables from './variables';

/**
 * Setup de var CSS
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
 * Component global pour nos pages
 * https://styled-components.com/docs/api#createglobalstyle
 */
const GlobalStyle = createGlobalStyle`
${variables};

html{
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

*, *:before, *:after {
    box-sizing: inherit;
}

body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    min-height: 100%;
    background-color: var(--black);
    color: white;
    font-family: var(--font);
    font-size: var(--fsize-md);
}

h1, h2, h3, h4, h5, h6 {
    letter-spacing: -.04em;
    margin: 0 0 10px;
}

p {
    margin: 0 0 10px;
}

a, button {
    transition: all 0.3s ease;
    color: inherit;
    text-decoration: none;
}

a {
    text-decoration: none;
    color: inherit;
    &:hover, &:focus {
        text-decoration: underline;
        color: inherit;
    } 
}

button {
    border: 0;
    cursor: pointer;
    font-family: inherit;
    border-radius: var(--border-radius-pill);
    background-color: rgba(0,0,0,.7);
    color: white;
    font-size: var(--fsize-sm);
    font-weight: 700;
    padding: var(--spacing-xs) var(--spacing-sm);

    &:hover, &:focus {
        background-color: var(--dark-grey);
        outline: 0;
    }
}

img {
    width: 100%;
    max-width: 100%;
    vertical-align: middle;
}

main {
    position: relative;
    padding: var(--spacing-xxl) 0;
}

.app {
    min-height: 100vh;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .overflow-ellipsis {
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: unset;
    word-break: break-all;
  }

  .empty-notice {
    color: var(--grey);
    font-size: var(--fz-lg);
    text-align: center;
    padding: var(--spacing-xxl);
  }

`;

export default GlobalStyle;