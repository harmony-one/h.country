import {Box} from "grommet";
import styled from 'styled-components'

export const PlainButton = styled(Box)<{ isActive?: boolean }>`
    border: 1px solid #454545;
    padding: 2px 4px;

    ${props => props.isActive && `
        background-color: grey;
    `}
`
