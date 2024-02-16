import React from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import {useNavigate} from "react-router-dom";

export const AppMenu = () => {
  const navigate = useNavigate()
  const { wallet } = useUserContext();

  return <Box>
    <Box direction={'row'} justify={'between'}>
      <Box onClick={() => navigate(`/`)}>
        <Text>h.country</Text>
      </Box>
      <Box onClick={() => navigate(`/0/${wallet?.address.replace('0x', '')}`)}>
        <Text>
          0/{wallet?.address.substring(2, 6)}
        </Text>
      </Box>
    </Box>
    {/*<Box align={'end'}>*/}
    {/*  <Box direction="row" gap={'8px'} align={'center'}>*/}
    {/*    {wallet && <Box direction={'row'} gap={'8px'} align={'center'}>*/}
    {/*      <Typography.Text style={{ fontSize: '16px' }} copyable={{ text: wallet?.address }}>*/}
    {/*        {wallet ? shortenAddress(wallet.address) : 'Wallet not available'}*/}
    {/*      </Typography.Text>*/}
    {/*    </Box>}*/}
    {/*  </Box>*/}
    {/*</Box>*/}
  </Box>
}
