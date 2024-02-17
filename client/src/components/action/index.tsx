import React from "react";
import {Box, Text} from "grommet";
import {Link} from "react-router-dom";
import {Action} from "../../types";

export const UserAction = (props: { action: Action }) => {
  const { action } = props

  return <Box border={{ side: "bottom" }} pad={"4px 0"}>
    {action.type === "new_user" ? 
      (<Text size={"small"}>
        {action.timestamp} - {" "}
        {action.fromShort} {" "}
        <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
      </Text>)
      :
      (<Text size={"small"}>
        {action.timestamp} - {" "}
        <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
        {" tags #"}
        {action.payload}
        {" on "}
        <Link className="link" to={`/0/${action.to}`}>0/{action.toShort}</Link>
      </Text>)
    }
  </Box>
}
