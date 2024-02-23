import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../configs/firebase-config";
import { useUserContext } from "../../../context";
import { Action } from "../../../types";
import { Box, Button } from "grommet";
import { HeaderText, SmallHeaderText } from "../headerList";
import { TagItem } from "./useTopTags";
import { MAX_TAG_LENGTH } from ".";

export const useTopLocations = () => {
    const { pageOwnerAddress } = useUserContext();
    const [locationItems, setLocationItems] = useState<TagItem[]>([]);

    useEffect(() => {
        if (!pageOwnerAddress) return;

        const messagesQuery = query(
            collection(db, "actions"),
            where("from", "==", pageOwnerAddress),
            where("type", "in", ["tag", "multi_tag", "location", 'link'])
        );

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const messages: Action[] = querySnapshot.docs.map((doc) => doc.data()) as Action[];

            const locationFrequency = messages.reduce<Record<string, number>>((acc, message) => {
                if (message.address.short) {
                    acc[message.address.short] = (acc[message.address.short] || 0) + 1;
                }
                return acc;
            }, {});

            const tagsList = Object.entries(locationFrequency);

            const sortedHashtags = tagsList
                .filter((item) => item[0] !== "")
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([text, count]) => ({
                    id: text, // Use hashtag as a unique ID
                    text: (<Button plain>
                        <Box direction={"row"}>
                            <HeaderText>
                                {text.length > MAX_TAG_LENGTH ? text.slice(0,MAX_TAG_LENGTH) : text}
                            </HeaderText>
                            <SmallHeaderText>{count}</SmallHeaderText>
                        </Box>
                    </Button>)
                }))

            setLocationItems(sortedHashtags);
        });

        return () => unsubscribe();
    }, [pageOwnerAddress]);

    return locationItems;
}