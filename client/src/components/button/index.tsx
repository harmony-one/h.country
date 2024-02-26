import {Box, Text} from "grommet";
import styled from 'styled-components'

export const PlainButton = styled(Box)<{ isActive?: boolean, fontColor?: string }>`
    min-width: 32px;
    user-select: none;
    text-align: left;
    /* box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); */
    //border: 1px solid #454545;
    padding: 2px 0;
    border: 0;
    // border-radius: 4px;
    ${props => props.isActive && `
        
    `}
`

export const PlainText = styled(Text)<{ fontSize?: string, color?: string}>`
    font-size: ${props => props.fontSize || '18px' };
    color: ${props => props.color ?? props.theme.global.colors.grey1};
`
