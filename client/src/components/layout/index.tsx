import React from 'react'
import {Box} from "grommet";
import {Outlet} from "react-router-dom";
import {AppMenu} from "../menu";

export const AppLayout = () => {
  return <Box background={'background'}>
    <Box
      pad={'8px 16px'}
      background={'background'}
      style={{
        position: 'sticky',
        top: '0px'
    }}
    >
      <AppMenu />
    </Box>
    <Box
      width={'700px'}
      margin={'0px auto'}
    >
      <Outlet />
    </Box>
  </Box>
}
