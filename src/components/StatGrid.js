import { StyledGrid } from "../styles";
import Tooltip from "@mui/material/Tooltip"; 
import Fade from '@mui/material/Fade';

const desc = new Map([
    ["Acoustique", "Décrit à quel point une piste est accoustique"],
    ["Dansabilité", "Décrit à quel point une piste est adaptée à la danse en fonction d'une combinaison d'éléments musicaux, notamment le tempo, la stabilité du rythme, la force des battements et la régularité générale."],
    ["Énergie", "Décrit le taux d'énergie d'une piste. En règle générale, les morceaux énergiques sont rapides, forts et bruyants. Par exemple, le death metal a une énergie élevée, tandis qu'un prélude de Bach est bas sur l'échelle."],
    ["Instrumentalité", "Décrit si une piste ne contient pas de voix. Les sons \"Ooh\" et \"aah\" sont traités comme instrumentaux dans ce contexte. Les morceaux de rap ou de créations orales sont clairement \"vocaux\"."],
    ["Valence", "Décrit la positivité musicale véhiculée par un morceau"]
])

const StatGrid = ({stats}) => (
    <>
        {stats ? (
            <StyledGrid>
                {Array.from(stats).map(([key, value]) => (
                    <Tooltip title={desc.get(key)} TransitionComponent={Fade} followCursor key={key}>
                        <li className="grid_item" key={key}>
                            <div className="grid_item_inner">
                                    <p className="grid_item_stat_value">{value}</p>
                                    <h3 className='grid_item_stat_name'>{key}</h3>
                            </div>
                        </li>
                    </Tooltip>
                ))}
            </StyledGrid>
        ): (
        <p className='empty-notice'>Pas de stats à afficher 😔</p>
        )}
    </>
)

export default StatGrid;