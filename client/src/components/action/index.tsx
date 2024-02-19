import React, { useEffect, useState } from "react";
import { Box, Text } from "grommet";
import { Link } from "react-router-dom";
import moment from 'moment'
import { Action } from "../../types";
import { socialUrlParser, formatAddress } from "../../utils";
import { useUserContext } from "../../context/UserContext";
import styled from "styled-components";

enum ActionType {
  self = 'self',
  other = 'other',
  verified = 'verified',
  none = 'none'
} 
const handleActionType = (type: ActionType) => {
  switch (type) {
    case 'verified':
      return "#a0ffa0 !important"
    case 'other':
      return "#FFF7AD !important";
    case 'self':
      return "#64ebfd !important"; // self
    default:
      return "#fff !important";
  }
};

const ActionText = styled(Text)<{ type?: ActionType }>`
  color: ${(props) => props.type && handleActionType(props.type)};
  cursor: ${(props) => props.type && props.type !== 'none' ? 'pointer' : 'auto'};
`
const ActionLink = styled(Link)<{ type?: ActionType }>`
  :visited, :link, :hover, :active {
    color: ${(props) => props.type && handleActionType(props.type)};
  }
  
  text-decoration: ${(props) => props.type && props.type !== 'none' ? 'underline' : 'none'}
`;

export interface UserActionProps {
  action: Action
  onTagClicked?: (hashtag: string) => void
}

export const UserAction = (props: UserActionProps) => {
  const { action } = props
  const { wallet } = useUserContext();
  const [actionType, setActionType] = useState<ActionType>(ActionType.none)
  
  useEffect(() => {
    const myAddress = wallet?.address.slice(2);
    if (myAddress === action.from) {
      setActionType(ActionType.self)
    } else {
      setActionType(ActionType.other)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const onTagClicked = () => {
    if (props.onTagClicked && action.payload) {
      props.onTagClicked(action.payload)
    }
  }

  return <Box border={{ side: "bottom", color: '#565654' }} pad={"4px 0"}>
    {action.type === "new_user" &&
      <Box pad={'0 16px'}>
        <Text size={"small"}>
          <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
          {" joins"}
        </Text>
      </Box>}
    {action.type === 'tag' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis="50%">
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
          <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {" tags "}
            <ActionText size={"small"} onClick={onTagClicked} type={actionType}>#{action.payload}</ActionText>
            {" on "}
            <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
          </Text>
        </Box>
        <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <Text style={{ textAlign: "right" }} size={"small"}>
            {action.address.short || formatAddress(action.address.road)}
          </Text>
        </Box>
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"small"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>}
    {action.type === 'link' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis="50%">
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {" links "}
            <ActionText size={"small"} type={ActionType.none}>{socialUrlParser(action.payload || '')[0]?.name}</ActionText>
            {' '}
            <ActionLink className="link" to={`/0/${action.from}`} type={actionType}>{
              socialUrlParser(action.payload || '')[0]?.type + '/' + socialUrlParser(action.payload || '')[0]?.username
            }
            </ActionLink>
          </Text>
        </Box>
        <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <Text style={{ textAlign: "right" }} size={"small"}>
            {action.address.short || formatAddress(action.address.road)}
          </Text>
        </Box>
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"small"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>}
  </Box>
}
