import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Spinner, Text } from "grommet";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import styled from "styled-components";
import { StarOutlined } from "@ant-design/icons"; // FireOutlined, HeartOutlined, 

import { addMessageWithGeolocation } from "../../api";
import { useActionsContext } from "../../context";
import { UserAction } from "../../components/action";
import { isSameAddress, isValidAddress } from "../../utils/user";
import { formatAddress, linkToMapByAddress } from "../../utils";
import { useUserContext } from "../../context/UserContext";
import { db } from "../../configs/firebase-config";

import { HeaderList, HeaderText, SmallHeaderText } from "./headerList";
import { PlainButton, PlainText } from "../../components/button";
import { predefinedLinks } from "../../components/links";


const UserPageBox = styled(Box)`
  .filter-panel {
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: center;
  }
`;

interface LinkItem {
  id: string;
  text: JSX.Element;
  predefined?: boolean;
  providerName?: string;
}

interface TagItem {
  id: string;
  text: JSX.Element;
}

type TagPayload = string;
type MultiTagPayload = { count: number; tag: string };

interface Message {
  id: string;
  payload?: TagPayload | MultiTagPayload; 
  type: string;
}

function isHex(num: string): Boolean {
  return (
    Boolean(num.match(/^0x[0-9a-f]+$/i)) ||
    Boolean(`0x${num}`.match(/^0x[0-9a-f]+$/i))
  );
}
export const UserPage = (props: { id: string }) => {
  const { wallet } = useUserContext();
  const { id: key } = props;
  const [urls, setUrls] = useState<LinkItem[]>([]);
  const [isUserPage, setIsUserPage] = useState(false);
  const [tagItems, setTagItems] = useState<TagItem[]>([]);

  const {
    actions,
    filters,
    setFilters,
    filterMode,
    setFilterMode,
    DefaultFilterMode,
    isLoading,
  } = useActionsContext();

  useEffect(() => {
    if (!key) return;
    const docRef = doc(db, "userLinks", key);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        let linkItems: LinkItem[] = predefinedLinks.map(
          ({ key, providerName, displayName }) => {
            // Check if the key exists in the fetched data
            if (data[key] && data[key].username && data[key].url) {
              return {
                id: docSnap.id + key,
                text: (<HeaderText>
                  <a
                    href={data[key].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    {`${key}/${data[key].username}`}
                  </a></HeaderText>
                ),
                predefined: false,
                providerName: providerName,
              };
            } else {
              // Return a default link item with the display text if the key does not exist
              return {
                id: docSnap.id + key,
                text: <HeaderText>{displayName}</HeaderText>,
                predefined: true,
                providerName: providerName,
              };
            }
          }
        );

        setUrls(linkItems);
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
  }, [key]);

  useEffect(() => {
    if (wallet) {
      setIsUserPage(isSameAddress(wallet.address.substring(2), key));
    }

    const messagesQuery = query(
      collection(db, "actions"),
      where("to", "==", key),
      where("type", "in", ["tag", "multi_tag"])
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: Message[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Message[];

      const hashtagFrequency = messages.reduce<Record<string, number>>((acc, message) => {
        const payload = message.payload;
        if (message.type === "tag") {
          if (typeof payload === 'string') {
            acc[payload] = (acc[payload] || 0) + 1;
          }
        } else if (message.type === "multi_tag") {
          if (typeof payload === 'object' && 'tag' in payload && 'count' in payload) {
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
        .slice(0, 9)
        .map(([hashtag, count]) => ({
          id: hashtag, // Use hashtag as a unique ID
          text: (
            <Button
              onClick={async (e) => {
                e.preventDefault();
                if (wallet !== undefined && key !== undefined) {
                  const addressWithoutPrefix = wallet.address.slice(2);
                  await addMessageWithGeolocation(
                    addressWithoutPrefix,
                    `#${hashtag} @${key}`
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
  }, [wallet, key, filters.length]);

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
        text: (<HeaderText>
          <a
            href={linkToMapByAddress(latestLocation)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            {`m/${
              latestLocation?.short || formatAddress(latestLocation?.road)
            }`}
          </a>
          </HeaderText>),
      },
      ...urls,
    ];
  }, [actions, urls, wallet?.address]);

  if (!key || !isValidAddress(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  const onTagClicked = (hashtag: string) => {
    if (!filters.find((item) => item.value === hashtag)) {
      setFilters([
        ...filters,
        {
          type: "hashtag",
          value: hashtag,
        },
      ]);
      setFilterMode("hashtag");
    }
  };

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

  const headerListProps = {
    userId: key,
    isLoading,
    isUserPage,
    wallet,
  };

  return (
    <UserPageBox>
      <Box gap={"16px"} pad={"0 16px"}>
        <HeaderList {...headerListProps} type={"url"} items={extendedUrls} />
        <HeaderList {...headerListProps} type={"hashtag"} items={tagItems} />
      </Box>
      <div className="filter-panel">
        <Box direction={"row"}>
          <PlainButton
            isActive={filterMode === "all"}
            onClick={() => setFilterMode("all")}
          >
            <PlainText fontSize="min(1em, 4vw)">all</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "address"}
            onClick={() => setFilterMode("address")}
            fontColor={isUserPage ? "blue1" : "yellow1"}
          >
            <PlainText
              fontSize="min(1em, 4vw)"
              color={isUserPage ? "blue1" : "yellow1"}
            >
              {key?.substring(0, 4)}
            </PlainText>
          </PlainButton>
          {filters
            .filter((f) => f.value !== "one" && f.value !== "ai")
            .map((filter) => {
              const { value } = filter;
              const onClick = () => {
                const newFilters = filters.filter(
                  (item) => item.value !== value
                );
                setFilters(newFilters);
                if (newFilters.length === 0) {
                  setFilterMode(DefaultFilterMode);
                }
              };
              return (
                <PlainButton
                  key={value}
                  isActive={filters.length > 0}
                  onClick={onClick}
                >
                  <Text color={isUserPage ? "blue1" : "yellow1"}>#{value}</Text>
                </PlainButton>
              );
            })}
        </Box>
        <Box direction={"row"} alignSelf="center" alignContent="around">
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "one")) {
                const newFilters = filters.filter(
                  (item) => item.value !== "one"
                );
                setFilters(newFilters);
              } else {
                setFilters([
                  ...filters,
                  {
                    type: "location",
                    value: "one",
                  },
                ]);
                setFilterMode("hashtag");
              }
            }}
          >
            <PlainText fontSize="min(1em, 4vw)">#one</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "ai")) {
                const newFilters = filters.filter(
                  (item) => item.value !== "ai"
                );
                setFilters(newFilters);
              } else {
                setFilters([
                  ...filters,
                  {
                    type: "location",
                    value: "ai",
                  },
                ]);
                setFilterMode("hashtag");
              }
            }}
          >
            <PlainText fontSize="min(1em, 4vw)">#ai</PlainText>
          </PlainButton>
          <PlainButton style={{ padding: '2px'}}>
            <PlainText fontSize="min(1em, 4vw)">
              <StarOutlined />
            </PlainText>
          </PlainButton>
        </Box>
      </div>
      <Box>
        {isLoading && (
          <Box align={"center"}>
            <Spinner color={"spinner"} />
          </Box>
        )}
        {!isLoading && actions.length === 0 && (
          <Box align={"center"}>
            <Text>No actions found</Text>
          </Box>
        )}
        {!isLoading && actions
            .slice(0, 30)
            .map((action, index) => (
              <UserAction
                userId={key}
                key={index + action.timestamp}
                action={action}
                onTagClicked={onTagClicked}
                onLocationClicked={onLocationClicked}
              />
        ))}
      </Box>
    </UserPageBox>
  );
};
