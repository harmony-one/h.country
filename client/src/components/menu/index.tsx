import React from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import { LocationButton } from './LocationButton';
import { useNavigate } from 'react-router-dom';

export const AppMenu = () => {
  const { wallet } = useUserContext();
  const navigate = useNavigate();
  const handleCopyPrivateKey = () => {
    const privateKey = wallet!.privateKey!.substring(2);
  
    navigator.clipboard.writeText(privateKey).then(() => {
      navigate(`/0/${wallet!.address.substring(2)}`);
    }).catch(_ => {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = privateKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      navigate(`/0/${wallet!.address.substring(2)}`);
    });
  };
  
  return <Box>
    <Box direction={'row'} justify={'between'}>
      <Box onClick={handleCopyPrivateKey}>
        <Text color={"blue1"} onClick={() => navigate('/')}>
          h.country
        </Text>
      </Box>
      <a href="https://harmony.one/hcountry" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'none' }}>
        <Text margin={{ left: 'medium' }} color={"grey1"}>
          about
        </Text>
      </a>
      <Box flex="grow" />
      <Box>
        <LocationButton />
      </Box>
    </Box>
  </Box>
}
