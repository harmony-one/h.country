import React from 'react'
import {Box} from "grommet";
import {Outlet} from "react-router-dom";
import {AppMenu} from "../menu";

export const AppLayout = () => {
  return <Box background={'background'} pad={'16px'}>
    <AppMenu />
    <Box
      width={'700px'}
      margin={'0 auto'}
    >
      <Outlet />
    </Box>
  </Box>
}
