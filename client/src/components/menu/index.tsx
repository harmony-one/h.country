import React from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import {useNavigate, useParams} from "react-router-dom";

export const AppMenu = () => {
  const navigate = useNavigate()
  const { wallet } = useUserContext();
  const { key } = useParams();

  const isValidAddress = (key: string): boolean => {
    const hexRegExp = /^[0-9a-fA-F]+$/;
    return key.length === 40 && hexRegExp.test(key);
  };

  const keyColor = key === wallet?.address.substring(2) ? "blue1" : "yellow1";

  return <Box>
    <Box direction={'row'} justify={'between'}>
    <Box flex="grow">
        {
          key && isValidAddress(key) &&
          <Text color={keyColor}>
            0/{key.substring(0,4)}
          </Text>
        }
      </Box>
      <Box onClick={() => navigate(`/0/${wallet?.address.replace('0x', '')}`)}>
        <Text color={"blue1"}>
          0/{wallet?.address.substring(2, 6)}
        </Text>
      </Box>
    </Box>
  </Box>
}
