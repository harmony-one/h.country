import React, { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../configs/firebase-config";
import { useActionsContext, useUserContext } from "../../../context";
import { HeaderText } from "../headerList";
import { predefinedLinks } from "../../../components/links";
import { formatAddress, linkToMapByAddress } from "../../../utils";

interface LinkItem {
    id: string;
    text: JSX.Element;
    predefined?: boolean;
    providerName?: string;
}

const MaxStringLength = 10

export const useUrls = () => {
    const { actions } = useActionsContext();
    const { pageOwnerAddress, wallet } = useUserContext();
    const [urls, setUrls] = useState<LinkItem[]>([]);

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

                setUrls(linkItems.concat(customLinkItems));
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

        return [
            {
                id: "latest_location" + latestLocation?.postcode,
                text: (
                    <HeaderText>
                        <a
                            href={linkToMapByAddress(latestLocation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none" }}
                        >
                            {`m/${
                              latestLocation?.short?.slice(0, MaxStringLength - 2)
                              || formatAddress(latestLocation?.road)
                            }`}
                        </a>
                    </HeaderText>
                ),
            },
            ...urls,
        ];
    }, [actions, urls, wallet?.address]);

    return extendedUrls;
}
