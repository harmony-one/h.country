import React from "react";
import {Box, Text} from "grommet";
import {Link} from "react-router-dom";
import moment from 'moment'
import {Action} from "../../types";

export interface UserActionProps {
  action: Action
  onTagClicked?: (hashtag: string) => void
}

export const UserAction = (props: UserActionProps) => {
  const { action } = props

  const onTagClicked = () => {
    if(props.onTagClicked && action.payload) {
      props.onTagClicked(action.payload)
    }
  }

  return <Box border={{ side: "bottom", color: '#565654' }} pad={"4px 0"}>
    {action.type === "new_user" ?
      <Box pad={'0 16px'}>
        <Text size={"small"}>
          <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
          {" joins"}
        </Text>
      </Box>
      :
      <Box direction={'row'} justify={'between'} pad={'0 16px'}>
        <Box>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
            {" tags "}
            <Text size={"small"} onClick={onTagClicked}>#{action.payload}</Text>
            {" on "}
            <Link className="link" to={`/0/${action.to}`}>0/{action.toShort}</Link>
          </Text>
        </Box>
        <Box align={'end'} style={{ minWidth: '32px' }}>
          <Text size={"small"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>
    }
  </Box>
}
