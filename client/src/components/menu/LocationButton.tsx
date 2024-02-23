import React, { useCallback, useEffect, useState } from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import { getLatestLocation } from '../../api/firebase';
import { AddressComponents } from '../../types';
import { formatAddress } from '../../utils';
import { addMessageWithGeolocation } from '../../api';
import { useActionsContext } from '../../context';

export const LocationButton = () => {
    const { wallet, pageOwnerAddress } = useUserContext();
    const { loadActions } = useActionsContext();
    const [latestLocation, setLatestLocation] = useState<AddressComponents>();

    const syncUserLocation = useCallback(async () => {
        if (wallet?.address) {
            const action = await getLatestLocation(wallet.address.slice(2));
            setLatestLocation(action?.address);
        }
    }, [wallet?.address]);

    useEffect(() => {
        syncUserLocation()

        if (wallet?.address) {
            addMessageWithGeolocation(wallet.address.slice(2), 'check-in').then(
                () => syncUserLocation()
            )
        }

        const intervalId = setInterval(syncUserLocation, 5000);

        return clearInterval(intervalId);
    }, [wallet?.address, syncUserLocation]);

    const onCLickLocation = useCallback(async () => {
        if (wallet?.address && latestLocation && pageOwnerAddress) {
            const locationShort = latestLocation.short || formatAddress(latestLocation.road);

            const addressWithoutPrefix = wallet.address.slice(2);

            await addMessageWithGeolocation(
                addressWithoutPrefix,
                `location @${pageOwnerAddress.substring(2)}`,
                locationShort
            );

            await loadActions();
        }
    }, [wallet?.address, latestLocation, pageOwnerAddress, loadActions]);

    if (!latestLocation) {
        return null;
    }

    return <Box onClick={() => onCLickLocation()}>
        <Text color={"grey1"}>
            {latestLocation.short || formatAddress(latestLocation.road)}
        </Text>
    </Box>;
}