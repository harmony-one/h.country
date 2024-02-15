import React from 'react'
import { Box } from "grommet";
import { useUserContext } from '../../context/UserContext';
import { useParams } from 'react-router-dom';

interface RouteParams {
  key: string;
}

const isValid = (key: string): boolean => {
  const hexRegExp = /^[0-9a-fA-F]+$/;
  return key.length === 40 && hexRegExp.test(key)
};

const isMyPage = (address: string | undefined, key: string): boolean => {
  if (!address) return false;
  return address.substring(2).toLowerCase() === key.toLowerCase();
};

export const UserPage = () => {
  const { wallet } = useUserContext();
  const { key } = useParams();

  if (!key || !isValid(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  const myPageResult = isMyPage(wallet?.address, key) ? 'True' : 'False';

  return (
    <Box>
      User Page: {key}
      <br />
      Your Address: {wallet?.address}
      <br />
      My Page: {myPageResult}
    </Box>
  );
};
