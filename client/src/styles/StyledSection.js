import styled from "styled-components/macro";

const StyledSection = styled.section`
&:first-of-type {
    .section_inner {
      padding-top: 0;
    }
  }

  .section_inner {
    width: 100%;
    max-width: var(--site-max-width);
    margin: 0 auto;
    position: relative;
    padding: var(--spacing-lg) var(--spacing-md);

    @media (min-width: 768px) {
      padding: var(--spacing-xl) var(--spacing-xxl);
    }
  }

  .section_top {
      display: flex;
      justify-content: space-between;
      align-items: strench;
      margin-bottom: var(--spacing-xl);
  }

  .section_heading {
      display: flex;
      margin 0;
      font-size: var(--fsize-xxl);
  }

  .section-breadcrumb {
      display: flex;
      color: var(--light-grey);
      
      &:after {
          content : '/';
          display: block;
          margin: 0 var(--spacing-sm)
      }

      a {
          &:hover, &:focus {
              color: white;
          }
      }
  }

  .section_see-all {
    display: flex;
    align-items: flex-end;
    text-transform: uppercase;
    color: var(--light-grey);
    font-size: var(--fsize-xxs);
    font-weight: 700;
    letter-spacing: 0.1em;
    padding-bottom: 2px;
  }

`;

export default StyledSection;