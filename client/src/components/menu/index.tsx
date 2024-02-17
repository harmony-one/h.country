import React from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import { useNavigate } from "react-router-dom";

export const AppMenu = () => {
  const navigate = useNavigate()
  const { wallet } = useUserContext();

  return <Box>
    <Box direction={'row'} justify={'between'}>
      <Box flex="grow" />
      <Box onClick={() => navigate(`/0/${wallet?.address.replace('0x', '')}`)}>
        <Text color={"blue1"}>
          0/{wallet?.address.substring(2, 6)}
        </Text>
      </Box>
    </Box>
  </Box>
}
