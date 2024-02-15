import React from 'react'
import {Box} from "grommet";
import {Outlet} from "react-router-dom";
import {AppMenu} from "../menu";

export const AppLayout = () => {
  return <Box>
    <AppMenu />
    <Box
      width={'700px'}
      margin={'0 auto'}
    >
      <Outlet />
    </Box>
  </Box>
}
