import React, { useEffect, useState } from "react";
import { Box, Text } from "grommet";
import { Link } from "react-router-dom";
import moment from 'moment'
import { Action } from "../../types";
import { socialUrlParser, formatAddress } from "../../utils";
import styled from "styled-components";
import useInterval from "../../hooks/useInterval";

export enum ActionType {
  self = 'self',
  other = 'other',
  verified = 'verified',
  none = 'none'
}
const handleActionTypeColor = (type: ActionType) => {
  switch (type) {
    case 'verified':
      return "#a0ffa0 !important"
    case 'other':
      return "#FFF7AD !important";
    case 'self':
      return "#64ebfd !important"; // self
    default:
      return "#B3B3B3 !important";
  }
};

export const handleActionType = (action: Action, walletAddress: string) => {
  // const myAddress = walletAddress ? walletAddress.slice(2) : '';
  if (walletAddress === action.from) {
    return ActionType.self
  } else {
    return ActionType.other
  }
}

export const ActionText = styled(Text) <{ type?: ActionType }>`
  font-size: min(1em, 4vw);
  color: ${(props) => props.type && handleActionTypeColor(props.type)};
  cursor: ${(props) => props.type && props.type !== 'none' ? 'pointer' : 'auto'};
`
export const ActionLink = styled(Link) <{ type?: ActionType }>`
  :visited, :link, :hover, :active {
    color: ${(props) => props.type && handleActionTypeColor(props.type)};
  }
  font-size: min(1em, 4vw);
  text-decoration: ${(props) => props.type && props.type !== 'none' ? 'underline' : 'none'};
`;

export interface UserActionProps {
  userId?: any
  action: Action
  onTagClicked?: (hashtag: string) => void
  onLocationClicked?: (location: string) => void
}

export const UserAction = (props: UserActionProps) => {
  const { action, userId } = props

  const [actionTime, setActionTime] = useState(moment(action.timestamp).fromNow())
  const [actionType, setActionType] = useState<ActionType>(ActionType.none)

  useEffect(() => {
    setActionType(handleActionType(action, userId || ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dynamically update date
  useInterval(() => {
    const delta = Date.now() - new Date(action.timestamp).valueOf()
    if(Math.ceil(delta) < 60_000) {
      setActionTime(`${Math.round(delta / 1000)}s`)
    } else if (delta < 24 * 60_000) {
      setActionTime(moment(action.timestamp).fromNow())
    }
  }, 1000)

  const onTagClicked = () => {
    if (props.onTagClicked && action.payload) {
      if (typeof action.payload === 'string') {
        props.onTagClicked(action.payload);
      } else if ('tag' in action.payload) {
        props.onTagClicked(action.payload.tag);
      }
    }
  }

  const onLocationClicked = (value?: string) => {
    if (props.onLocationClicked && value) {
      props.onLocationClicked(value)
    }
  }

  const address = action.address.short ||
    formatAddress(action.address.road)

  return <Box border={{ side: "bottom", color: '#565654' }} pad={"4px 0"}>
    {(action.type === 'tag' || action.type === 'new_user' || action.type === 'multi_tag') &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          {action.type === 'tag' &&
            <Text size={"small"} style={{ wordBreak: 'break-all' }}>
              <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
              {" "}
              <ActionText onClick={onTagClicked} type={actionType}>#{action.payload}</ActionText>
              {" "}
              <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
            </Text>
          }
          {action.type === 'multi_tag' &&
            <Text size={"small"} style={{ wordBreak: 'break-all' }}>
              <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
              {" "}
              <ActionText size={"small"} onClick={onTagClicked} type={actionType}>#{action.payload.tag}</ActionText>
              {" "}
              <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
              {" "}
              ({action.payload.count})
            </Text>
          }
          {action.type === 'new_user' &&
              <Text size={"medium"}>
                {action.payload && action.payload.referrerAddress &&
                    <ActionLink
                        className="link"
                        to={`/0/${action.payload.referrerAddress}`}
                        type={ActionType.other}
                    >
                        0/{action.payload.referrerAddress.slice(0, 4)}
                    </ActionLink>
                }
                {action.payload && action.payload.referrerAddress &&
                    <ActionText color='#B3B3B3'>{" adds "}</ActionText>
                }
                <ActionText color='#B3B3B3'>
                    <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
                </ActionText>
                {/* Referrer data is missing, display default text */}
                {! (action.payload && action.payload.referrerAddress) &&
                    <ActionText color='#B3B3B3'>{" joins "}</ActionText>
                }
              </Text>
          }
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <Text
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}
            size={"small"}>
            {address}
          </Text>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"xsmall"}>
            {actionTime}
          </Text>
        </Box>
      </Box>
    }
    {action.type === 'link' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {/* <ActionText size={"small"} type={ActionType.none}>{socialUrlParser(action.payload || '')[0]?.name}</ActionText>
            {' '} */}
            {' '}
            <ActionLink className="link" to={`/0/${action.from}`} type={actionType}>{
              socialUrlParser(action.payload || '', 'any')?.username
            }
            </ActionLink>
            {' '}
            <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
          </Text>
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <Text
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}
            size={"small"}>
            {address}
          </Text>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"xsmall"}>
            {actionTime}
          </Text>
        </Box>
      </Box>}
    {action.type === 'location' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {" "}
            <ActionText size={"small"} onClick={() => onLocationClicked(action.payload)} type={actionType}>{action.payload}</ActionText>
            {" "}
            <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
          </Text>
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <ActionText
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}>
            {address}
          </ActionText>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"xsmall"}>
            {actionTime}
          </Text>
        </Box>
      </Box>}
  </Box>
}
