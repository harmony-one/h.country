import React, {useEffect, useState} from "react";
import {Box, Spinner, Text} from "grommet";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import '../../index.css'
import {Action} from "../../types";
import {UserAction} from "../../components/action";
import {getMessages} from "../../api/firebase";
import { useUserContext } from "../../context/UserContext";

export const MainPage = () => {
  const { wallet, firstTimeVisit } = useUserContext();
  const navigate = useNavigate();
  const { key } = useParams();
  const location = useLocation();
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (wallet && wallet.address) {
      if (location.pathname === "/home") {
        navigate(`/0/${wallet.address.substring(2)}`);
      } else if (firstTimeVisit) {
        navigate('/hash');
      } else {
        navigate(`/0/${wallet.address.substring(2)}`);
      }
    }
  }, [wallet, navigate, firstTimeVisit, location.pathname]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const items = await getMessages()
        setActions(items)
        if (items.length <= 1) {
          navigate('/hash');
        }
      } catch (e) {
        console.error('Failed to load messages:', e)
      } finally {
        setLoading(false)
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
