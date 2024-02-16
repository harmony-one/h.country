import React, {useEffect, useState} from "react";
import {Box, Spinner, Text} from "grommet";
import {useParams} from "react-router-dom";
import '../../index.css'
import {Action} from "../../types";
import {UserAction} from "../../components/action";
import {getMessages} from "../../api/firebase";

export const MainPage = () => {
  const { key } = useParams();
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const items = await getMessages()
        setActions(items)
      } catch (e) {
        console.error('Failed to load messages:', e)
      } finally {
        setLoading(false)
      }
    };
    loadData();
  }, [key]);

  return (
    <Box>
      {isLoading &&
        <Box align={'center'}>
            <Spinner color={'spinner'} />
        </Box>
      }
      {!isLoading && actions.length === 0 &&
        <Box align={'center'}>
            <Text>No messages found</Text>
        </Box>
      }
      {!isLoading && actions.map((action, index) => (
        <UserAction key={index + action.timestamp} action={action} />
      ))}
    </Box>
  );
};
