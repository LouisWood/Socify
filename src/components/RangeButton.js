import {StyledRangeButtons} from '../styles';

const Rangebutton = ({activeRange, setActiveRange}) => {
    return (
        <StyledRangeButtons>
            <li>
                <button className={activeRange=== 'short' ? 'active' : ''}
                onClick={() => setActiveRange('short')}>Ce mois-ci</button>
            </li>

            <li>
                <button className={activeRange=== 'medium' ? 'active' : ''}
                onClick={() => setActiveRange('medium')}>Ces 6 derniers mois</button>
            </li>

            <li>
                <button className={activeRange=== 'long' ? 'active' : ''}
                onClick={() => setActiveRange('long')}>All time</button>
            </li>
        </StyledRangeButtons>
    );
};

export default Rangebutton;