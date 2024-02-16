import React from "react";
import { Box, Text } from "grommet";
import { Link } from "react-router-dom";
import { Action } from "../../types";

export const UserAction = (props: { action: Action }) => {
  const { action } = props;

  return (
    <Box border={{ side: "bottom" }} pad={"4px 0"}>
      <Text size={"small"}>
        {action.timestamp} - {" "}
        <Link className="link" to={`/0/${action.username}`}>0/{action.usernameShort}</Link>
        {action.hashtag ? ` tags #${action.hashtag}` : ` links ${action.link}`}
        {" on "}
        <Link className="link" to={`/0/${action.mention}`}>0/{action.mentionShort}</Link>
      </Text>
    </Box>
  );
};

