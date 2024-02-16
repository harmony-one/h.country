import React from 'react'
import { Box } from "grommet"
import { useUserContext } from "../../context/UserContext";

export const AppMenu = () => {
  return <Box>
    <Box direction={'row'} justify={'between'}>
      <Box>h.country</Box>
      <Box>0/beef</Box>
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
