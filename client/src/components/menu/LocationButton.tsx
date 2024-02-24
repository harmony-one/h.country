import React, { useCallback, useEffect, useState } from 'react'
import { Box, Text } from "grommet"
import { useUserContext } from '../../context/UserContext'
import { getLatestLocation } from '../../api/firebase';
import { AddressComponents } from '../../types';
import { formatAddress } from '../../utils';
import { addMessageWithGeolocation, getCurrentLocation } from '../../api';
import { useActionsContext } from '../../context';
import { useTopTags } from '../../pages/user/hooks';

export const LocationButton = () => {
    const { wallet, pageOwnerAddress } = useUserContext();
    const tagItems = useTopTags()
    const { loadActions } = useActionsContext();
    const [latestLocation, setLatestLocation] = useState<AddressComponents>();

    const syncUserLocation = useCallback(async () => {
        if (wallet?.address) {
            let address = (await getLatestLocation(wallet.address.slice(2)))?.address;

            try {
                const location = await getCurrentLocation();

                if (address?.road && location?.road && location.road !== address.road) {
                    address = location;
                    await addMessageWithGeolocation(wallet.address.slice(2), 'check-in');
                }
            } catch (e) {
                console.log('Error to check location', e);
            }

            await setLatestLocation(address);
        }
    }, [wallet?.address]);

    useEffect(() => {
        syncUserLocation()

        const intervalId = setInterval(syncUserLocation, 60000);

        return () => clearInterval(intervalId);
    }, [wallet?.address, syncUserLocation]);

    useEffect(() => {
        if (tagItems.length > 0) {
            syncUserLocation()
        }
    }, [tagItems])

    const onCLickLocation = useCallback(async () => {
        if (wallet?.address) {
            const userInput = window.prompt(`Enter your location`);

            if (userInput !== null && userInput.trim() !== "") {
                const locationShort = userInput;

                const addressWithoutPrefix = wallet.address.slice(2);

                await addMessageWithGeolocation(
                    addressWithoutPrefix,
                    'check-in',
                    locationShort
                );

                setLatestLocation({ short: locationShort, road: locationShort });
            }
        }

        // if (wallet?.address && latestLocation && pageOwnerAddress) {
        //     const locationShort = latestLocation.short || formatAddress(latestLocation.road);

        //     const addressWithoutPrefix = wallet.address.slice(2);

        //     await addMessageWithGeolocation(
        //         addressWithoutPrefix,
        //         `location @${pageOwnerAddress.substring(2)}`,
        //         locationShort
        //     );

        //     await loadActions();
        // }
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