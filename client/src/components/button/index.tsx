import {Box} from "grommet";
import styled from 'styled-components'

export const PlainButton = styled(Box)<{ isActive?: boolean }>`
    min-width: 48px;
    user-select: none;
    text-align: center;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    //border: 1px solid #454545;
    padding: 2px 6px;
    border-radius: 4px;

    ${props => props.isActive && `
        
    `}
`
