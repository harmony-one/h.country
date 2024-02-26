import React, { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../configs/firebase-config";
import { useActionsContext, useUserContext } from "../../../context";
import { HeaderText } from "../headerList";
import { predefinedLinks } from "../../../components/links";
import { formatAddress, linkToMapByAddress } from "../../../utils";
import { PinIcon } from "../../../components/icons";
import { Box } from "grommet";
import { AddressComponents } from "../../../types";

interface LinkItem {
    id: string;
    text: JSX.Element;
    predefined?: boolean;
    providerName?: string;
}

const MaxStringLength = 10

export const LocationFilter = (props:
    { address: string, latestLocation: AddressComponents, onClick: (value: string) => void }
) => {
    const { address, latestLocation, onClick } = props;

    return <HeaderText>
        <Box direction="row" align="start">
            <a
                href={linkToMapByAddress(latestLocation?.road || address)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", margin: '2px 0 0 0' }}
            >
                <PinIcon size="18" color="rgb(42, 174, 233)" />
            </a>
            <Box
                onClick={() => onClick(address)}
                style={{ cursor: 'pointer' }}
            >
                {address.slice(0, 10)}
            </Box>
        </Box>
    </HeaderText>
}

export const useUrls = () => {
    const { actions, setFilters, filters, setFilterMode } = useActionsContext();
    const { pageOwnerAddress, wallet } = useUserContext();
    const [urls, setUrls] = useState<LinkItem[]>([]);

    const onLocationClicked = (location: string) => {
        if (!filters.find((item) => item.value === location)) {
            setFilters([
                ...filters,
                {
                    type: "location",
                    value: location,
                },
            ]);
            setFilterMode("location");
        }
    };

    useEffect(() => {
        if (!pageOwnerAddress) return;

        const docRef = doc(db, "userLinks", pageOwnerAddress);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                let linkItems: LinkItem[] = predefinedLinks.map(
                    ({ key, providerName, displayName }) => {
                        // Check if the key exists in the fetched data
                        if (data[key] && data[key].username && data[key].url) {
                            return {
                                id: docSnap.id + key,
                                text: (
                                    <HeaderText>
                                        <a
                                            href={data[key].url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: "none" }}
                                        >
                                            {`${key}/${data[key].username}`.slice(0, MaxStringLength)}
                                        </a>
                                    </HeaderText>
                                ),
                                predefined: false,
                                providerName: providerName,
                            };
                        } else {
                            // Return a default link item with the display text if the key does not exist
                            return {
                                id: docSnap.id + key,
                                text: <HeaderText>{displayName.slice(0, MaxStringLength)}</HeaderText>,
                                predefined: true,
                                providerName: providerName,
                            };
                        }
                    }
                );

                const keyToExclude = predefinedLinks.map((l) => l.key);

                const customLinkItems = Object.keys(data)
                    .filter(key => !keyToExclude.includes(key))
                    .map(key => ({
                        id: docSnap.id + key,
                        text: (
                            <HeaderText>
                                <a
                                    href={data[key].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "none" }}
                                >
                                    {data[key].username.slice(0, MaxStringLength)}
                                </a>
                            </HeaderText>),
                        predefined: false,
                        // providerName: providerName,
                    }))

                const urlsList = linkItems.concat(customLinkItems.reverse()).slice(0, 8)
                setUrls(urlsList);
            } else {
                console.log("No such document!");
                // for other users (isUserPage == false)
                setUrls(
                    predefinedLinks.map(({ key, providerName, displayName }) => ({
                        id: "default" + key,
                        text: <HeaderText>{displayName}</HeaderText>,
                        predefined: true,
                        providerName: providerName,
                    }))
                );
            }
        });

        return () => unsubscribe();
    }, [pageOwnerAddress]);

    const extendedUrls = useMemo<LinkItem[]>(() => {
        const latestLocation = actions.find(
            (a) => a.from === wallet?.address.slice(2) && !!a.address.road
        )?.address;

        if (!latestLocation?.road) {
            return urls;
        }

        const address = latestLocation?.short?.slice(0, MaxStringLength) || formatAddress(latestLocation?.road);
        const trimmedAddress = address.length > 12 ? `${address.slice(0, 12)}...` : address

        return [
            {
                id: "latest_location" + latestLocation?.postcode,
                text: (
                    <Box margin={{ left: "-6px" }}>
                        <LocationFilter
                            latestLocation={latestLocation}
                            address={trimmedAddress}
                            onClick={() => onLocationClicked(address)}
                        />
                    </Box>
                ),
            },
            ...urls,
        ];
    }, [actions, urls, wallet?.address]);

    return extendedUrls;
}
