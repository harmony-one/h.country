import React from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import { LocationButton } from './LocationButton';

export const AppMenu = () => {
  const { wallet } = useUserContext();
  const handleCopyPrivateKey = () => {
    const privateKey = wallet!.privateKey!.substring(2);
  
    navigator.clipboard.writeText(privateKey).then(() => {
      alert("copied key to clipboard");
    }).catch(_ => {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = privateKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert("copied key to clipboard");
    });
  };
  
  return <Box>
    <Box direction={'row'} justify={'between'}>
      <Box>
        <LocationButton />
      </Box>
      <Box flex="grow" />
      <Box onClick={handleCopyPrivateKey}>
        <Text color={"blue1"}>
          h.country
        </Text>
      </Box>
    </Box>
  </Box>
}
