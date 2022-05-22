import styled from "styled-components/macro";

const StyledTrackList = styled.ul`
list-style: none;
margin: 0;
padding: 0;

.track_item {
    display: grid;
    align-items: center;
    grid-template-columns: 20px 1fr;
    grid-gap: var(--spacing-md);
    padding: var(--spacing-xs);
    color: var(--light-grey);
    font-size: var(--fsize-sm);
    border-radius: var(--border-radius-subtle);
    transition: background-color 0.3s ease;
    cursor: default;

    @media (min-width: 768px) {
        grid-template-columns: 20px 4fr 2fr minmax(60px, 1fr);
        padding: var(--spacing-xs) var(--spacing-sm);
    }

    &:hover,
    &:focus {
        background-color: var(--dark-grey);
    }
}

.track_item_num {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: var(--fsize-md);
    font-variant-numeric: tabular-nums;
    overflow: visible;
  }

.track_item_title-group {
   display: flex;
   align-items: center;
 }

.track_item_img {
    margin-right: var(--spacing-sm);
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background-color: var(--dark-grey);
}

.track_item_name {
    color: var(--white);
    font-size: var(--fsize-md);
  }

.track_item_album {
    display: none;

   @media (min-width: 768px) {
      display: block;
      white-space: nowrap;
    }
}

.track_item_duration {
    display: none;

    @media (min-width: 768px) {
      display: flex;
      justify-content: flex-end;
      font-variant-numeric: tabular-nums;
    }
  }
`;

export default StyledTrackList;