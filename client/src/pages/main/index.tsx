import React, {useEffect, useState} from "react";
import {Box, Spinner, Text} from "grommet";
import {useNavigate, useParams} from "react-router-dom";
import '../../index.css'
import {Action} from "../../types";
import {UserAction} from "../../components/action";
import {getMessages} from "../../api/firebase";
import { useUserContext } from "../../context/UserContext";

export const MainPage = () => {
  const { wallet, firstTimeVisit } = useUserContext();
  const navigate = useNavigate();
  const { key } = useParams();
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (wallet && wallet.address) {
      if (firstTimeVisit) {
        navigate('/hash');
      } else {
        navigate(`/0/${wallet.address.substring(2)}`);
      }
    }
  }, [wallet, navigate, firstTimeVisit]);

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
