import React, { useState, useEffect } from "react";
import { Box, Text } from "grommet";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../configs/firebase-config";
import '../../index.css'

interface Action {
  timestamp: string;
  username: string;
  usernameShort: string;
  hashtag?: string;
  mention?: string;
  mentionShort?: string;
}

const UserAction = (props: { action: string }) => {
  return (
    <Box border={{ side: "bottom" }} pad={"4px 0"}>
      <Text size={"small"}>{props.action}</Text>
    </Box>
  );
};

export const MainPage = () => {
  const { key } = useParams();
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const fetchAllMessages = async () => {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const formattedMessages = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const date = new Date(data.timestamp);
          const formattedTimestamp = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).replace(",", "").replace(/([AP]M)$/, " $1");
  
          return {
            timestamp: formattedTimestamp,
            username: data.username,
            usernameShort: data.username.substring(0, 4),
            hashtag: data.hashtags?.[0],
            mention: data.mentions?.[0],
            mentionShort: data.mentions?.[0]?.substring(0, 4),
          };
        })
        .filter((action) => action.mention && action.hashtag);
  
      setActions(formattedMessages);
    };
  
    fetchAllMessages();
  }, [key]);

  return (
    <Box>
      {actions.map((action, index) => (
        <Box key={index} border={{ side: "bottom" }} pad={"4px 0"}>
          <Text size={"small"}>
            {action.timestamp} - 
            <Link className="link" to={`/0/${action.username}`}>0/{action.usernameShort}</Link>
            {" tags #"}
            {action.hashtag}
            {" on "}
            <Link className="link" to={`/0/${action.mention}`}>0/{action.mentionShort}</Link>
          </Text>
        </Box>
      ))}
    </Box>
  );
};
