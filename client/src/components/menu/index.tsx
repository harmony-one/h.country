import React, { useCallback, useEffect, useState } from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import { useNavigate } from "react-router-dom";
import { getLatestLocation } from '../../api/firebase';
import { AddressComponents } from '../../types';
import { formatAddress, linkToMapByAddress } from '../../utils';

export const AppMenu = () => {
  const navigate = useNavigate()
  const { wallet } = useUserContext();
  const [latestLocation, setLatestLocation] = useState<AddressComponents>();

  const syncUserLocation = useCallback(async () => {
    if (wallet?.address) {
      const action = await getLatestLocation(wallet.address.slice(2));
      setLatestLocation(action?.address);
    }
  }, [wallet?.address]);

  useEffect(() => {
    syncUserLocation();

    const intervalId = setInterval(syncUserLocation, 5000);

    return clearInterval(intervalId);
  }, [wallet?.address]);

  return <Box>
    <Box direction={'row'} justify={'between'}>
      {latestLocation &&
        <Box onClick={() => navigate(`/0/${wallet?.address.replace('0x', '')}`)}>
          <a
            href={linkToMapByAddress(latestLocation)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', textDecoration: 'none' }}
          >
            {latestLocation.short || formatAddress(latestLocation.road)}
          </a>
        </Box>
      }
      <Box flex="grow" />
      <Box onClick={() => navigate(`/0/${wallet?.address.replace('0x', '')}`)}>
        <Text color={"blue1"}>
          0/{wallet?.address.substring(2, 6)}
        </Text>
      </Box>
    </Box>
  </Box>
}
