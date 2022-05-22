import styled from "styled-components/macro";

const StyledGrid = styled.ul`
list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: var(--spacing-sm);

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-gap: var(--spacing-lg);
  }

.grid_item {
    background-color: var(--near-black);
    border-radius: var(--border-radius-subtle);
    transition: background-color 0.3s ease;
    cursor: default;

    &:hover,
    &:focus {
      background-color: var(--dark-grey);

      img {
        box-shadow: 0 8px 24px rgb(0 0 0 / 50%);
      }
    }

    a {
      display: block;
      width: 100%;
      height: 100%;

      &:hover,
      &:focus {
        cursor: pointer;
        text-decoration: none;
      }
    }
  }

.grid_item_inner {
    padding: var(--spacing-sm);

    @media (min-width: 768px) {
      padding: var(--spacing-md);
    }
  }

.grid_item_img {
    position: relative;
    padding-top: 100%; 
    margin: 0 auto var(--spacing-lg);

    img {
        position: absolute; 
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background-color: var(--dark-grey);
        border-radius: ${props => props.type === 'artist' ? '100%' : '2px'}
    }
}

.grid_item_name {
    margin: 0 0  var(--spacing-xxs);
    font-size: var(--fsize-md);
    letter-spacing: normal;
}

.grid_item_label {
    font-size: var(--fsize-sm);
    color: var(--light-grey);
}

.grid_item_stat_name {
  margin: 0 0  var(--spacing-xxs);
  font-size: var(--fsize-xl);
  letter-spacing: normal;
  text-align : center;
}

.grid_item_stat_value {
  font-size: var(--fsize-xxl);
  text-align: center
}

`

export default  StyledGrid;