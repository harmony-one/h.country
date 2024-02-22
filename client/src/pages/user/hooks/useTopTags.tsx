import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../configs/firebase-config";
import { useUserContext } from "../../../context";
import { Box, Button } from "grommet";
import { HeaderText, SmallHeaderText } from "../headerList";
import { Message, TagItem } from "../UserPage";
import { isHex } from "../../../utils/getAddress/validators";
import { addMessageWithGeolocation } from "../../../api";

export const useTopTags = () => {
    const { pageOwnerAddress, wallet } = useUserContext();
    const [tagItems, setTagItems] = useState<TagItem[]>([]);

    useEffect(() => {
        if (!pageOwnerAddress) return;

        const messagesQuery = query(
            collection(db, "actions"),
            where("to", "==", pageOwnerAddress),
            where("type", "in", ["tag", "multi_tag"])
        );

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const messages: Message[] = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            })) as Message[];

            const hashtagFrequency = messages.reduce<Record<string, number>>(
                (acc, message) => {
                    const payload = message.payload;
                    if (message.type === "tag") {
                        if (typeof payload === "string") {
                            acc[payload] = (acc[payload] || 0) + 1;
                        }
                    } else if (message.type === "multi_tag") {
                        if (
                            typeof payload === "object" &&
                            "tag" in payload &&
                            "count" in payload
                        ) {
                            const tag = payload.tag as string;
                            const count = payload.count as number;
                            acc[tag] = (acc[tag] || 0) + count;
                        }
                    }

                    return acc;
                }, {});

            const tagsList = Object.entries(hashtagFrequency);

            const sortedHashtags = tagsList
                .filter((item) => item[0] !== "")
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([hashtag, count]) => ({
                    id: hashtag, // Use hashtag as a unique ID
                    text: (
                        <Button
                            onClick={async (e) => {
                                e.preventDefault();
                                if (wallet !== undefined && pageOwnerAddress !== undefined) {
                                    const addressWithoutPrefix = wallet.address.slice(2);
                                    await addMessageWithGeolocation(
                                        addressWithoutPrefix,
                                        `#${hashtag} @${pageOwnerAddress}`
                                    );
                                } else {
                                    console.log("Invalid user wallet");
                                }
                            }}
                            plain
                        >
                            <Box direction={"row"}>
                                <HeaderText>
                                    {isHex(hashtag) ? `0/${hashtag.substring(0, 4)}` : hashtag}
                                </HeaderText>
                                <SmallHeaderText>{count}</SmallHeaderText>
                            </Box>
                        </Button>
                    ),
                }));

            setTagItems(sortedHashtags);
        });

        return () => unsubscribe();
    }, [wallet, pageOwnerAddress]);

    return tagItems;
}