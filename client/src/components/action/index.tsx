import React, { useEffect, useState } from "react";
import { Box, Text } from "grommet";
import { Link } from "react-router-dom";
import moment from 'moment'
import { Action } from "../../types";
import { socialUrlParser, formatAddress } from "../../utils";
import styled from "styled-components";
import useInterval from "../../hooks/useInterval";
import { PlainText } from "../button";

export enum ActionType {
  self = 'self',
  other = 'other',
  verified = 'verified',
  none = 'none'
}
const handleActionTypeColor = (type: ActionType, theme: any) => {
  switch (type) {
    case 'verified':
      return `${theme.global.colors.green1}`;
    case 'other':
      return `${theme.global.colors.yellow1}`;
    case 'self':
      return `${theme.global.colors.blue1}`;
    default:
      return `${theme.global.colors.grey1}`;
  }
};

export const handleActionType = (action: Action, walletAddress: string) => {
  // const myAddress = walletAddress ? walletAddress.slice(2) : '';
  if (action.to === action.from) {
    return ActionType.self
  } else {
    return ActionType.other
  }
}

export const ActionText = styled(Text) <{ type?: ActionType }>`
  font-size: min(1em, 4vw);
  color: ${(props) => props.type && handleActionTypeColor(props.type, props.theme)};
  cursor: ${(props) => props.type && props.type !== 'none' ? 'pointer' : 'auto'};
`

export const ActionLink = styled(Link) <{ type?: ActionType }>`
  :visited, :link, :hover, :active {
    color: ${(props) => props.type && handleActionTypeColor(props.type, props.theme)};
  }
  font-size: min(1em, 4vw);
`;

export interface UserActionProps {
  userId?: any
  action: Action
  onTagClicked?: (hashtag: string) => void
  onLocationClicked?: (location: string) => void
}

const MAX_TAG_LENGTH = 15

const truncateTag = (tag: string) => {
  return tag.length > MAX_TAG_LENGTH ? tag.slice(0,MAX_TAG_LENGTH) : tag
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
    if (Math.ceil(delta) < 60_000) {
      setActionTime(`${Math.round(delta / 1000)}s`)
    } else if (delta < 24 * 60_000) {
      setActionTime(moment(action.timestamp).fromNow())
    }
  }, 5000)

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

  const socialData = action.type === 'link'
    ? socialUrlParser(action.payload || '', 'any')
    : null

  return <Box border={{ side: "bottom", color: 'border' }} pad={"4px 0"}>
    {(action.type === 'tag' || action.type === 'new_user' || action.type === 'multi_tag') &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          {action.type === 'tag' &&
            <Text size={"small"} style={{ wordBreak: 'break-all' }}>
              <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
              {" "}
              <ActionText onClick={onTagClicked} type={actionType}>#{truncateTag(String(action.payload))}</ActionText>
              {" "}
              <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
            </Text>
          }
          {action.type === 'multi_tag' &&
            <Text size={"small"} style={{ wordBreak: 'break-all' }}>
              <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
              {" "}
              <ActionText size={"small"} onClick={onTagClicked} type={actionType}>#{truncateTag(String(action.payload.tag))}</ActionText>
              {" "}
              <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
              {/* {" "}
              {typeof action.payload.count === 'object' ?
                '' :
                (String(action.payload.count))} */}
            </Text>
          }
          {action.type === 'new_user' &&
            <Text size={"small"}>
              {action.payload && action.payload.referrerAddress &&
                <ActionLink
                  className="link"
                  to={`/0/${action.payload.referrerAddress}`}
                  type={ActionType.none}
                >
                  0/{action.payload.referrerAddress.slice(0, 4)}
                </ActionLink>
              }
              {action.payload && action.payload.referrerAddress &&
                <ActionText color='grey1'>{" adds "}</ActionText>
              }
              <ActionText color='grey1'>
                <ActionLink
                  className="link"
                  to={`/0/${action.from}`}
                  type={ActionType.none}
                >
                  0/{action.fromShort}
                </ActionLink>
              </ActionText>
              {/* Referrer data is missing, display default text */}
              {!(action.payload && action.payload.referrerAddress) &&
                <ActionText color='grey1'>{" joins "}</ActionText>
              }
            </Text>
          }
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <PlainText fontSize='min(0.8em, 3.7vw)'
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}>
            {address.substring(0, 10)}
          </PlainText>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <PlainText fontSize='min(0.8em, 3vw)'>
            {actionTime}
          </PlainText>
        </Box>
      </Box>
    }
    {action.type === 'link' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "80%" : "90%"}>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {' '}
            <ActionLink className="link" to={`/0/${action.from}`} type={actionType}>{
              socialData?.username
            }
            </ActionLink>
            {' '}
            <ActionLink
                className="link"
                to={`/0/${action.from}`}
                type={ActionType.none}>
                {`${socialData?.type}/${socialData?.username}`.slice(0, 10)}
            </ActionLink>
          </Text>
        </Box>
        {address && <Box align={'end'} basis="20%" style={{ minWidth: '32px' }}>
          <PlainText fontSize='min(0.8em, 3.7vw)'
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}>
            {address.substring(0, 10)}
          </PlainText>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <PlainText fontSize='min(0.8em, 3vw)'>
            {actionTime}
          </PlainText>
        </Box>
      </Box>}
    {action.type === 'location' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {" "}
            <ActionText size={"small"} onClick={() => onLocationClicked(action.payload)} type={actionType}>{String(action.payload)}</ActionText>
            {" "}
            <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
          </Text>
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <PlainText fontSize='min(0.8em, 3.7vw)'
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}>
            {address.substring(0, 10)}
          </PlainText>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <PlainText fontSize='min(0.8em, 3vw)'>
            {actionTime}
          </PlainText>
        </Box>
      </Box>}
  </Box>
}
