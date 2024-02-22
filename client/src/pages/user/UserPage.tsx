import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Spinner, Text } from "grommet";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
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

interface Message {
  id: string;
  payload?: string[];
}

const parseTagsFromUrl = (hashtagList: string): [string, number][] => {
  const topics = hashtagList.split(",");
  return topics.map((topic) => {
    const [tag, counter = "1"] = topic.split("^");
    return [tag, Number(counter) || 0];
  });
};

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
  const [searchParams] = useSearchParams();
  const topicsQueryParam = searchParams.get("topics");
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
      where("type", "==", "tag")
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: Message[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Message[];

      const allHashtags = messages.flatMap((msg) => msg.payload || []);

      const hashtagFrequency = allHashtags.reduce<Record<string, number>>(
        (acc, hashtag) => {
          acc[hashtag] = (acc[hashtag] || 0) + 1;
          return acc;
        },
        {}
      );

      const tagsFromUrl = topicsQueryParam
        ? parseTagsFromUrl(topicsQueryParam || "")
        : [];

      const tagsList = tagsFromUrl.length
        ? tagsFromUrl
        : Object.entries(hashtagFrequency);

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
  }, [wallet, key, filters.length, topicsQueryParam]);

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
            <PlainText fontSize="min(1em, 4vw)" color='#B3B3B3'>all</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "address"}
            onClick={() => setFilterMode("address")}
            fontColor={isUserPage ? "blue1" : "yellow1"}
          >
            <PlainText
              fontSize="min(1em, 4vw)"
              color='#B3B3B3'
              // color={isUserPage ? "blue1" : "yellow1"}
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
                  <PlainText color={isUserPage ? "blue1" : "yellow1"}>#{value}</PlainText>
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
            <PlainText fontSize="min(1em, 4vw)" color='#B3B3B3'>#one</PlainText>
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
            <PlainText fontSize="min(1em, 4vw)" color='#B3B3B3'>#ai</PlainText>
          </PlainButton>
          <PlainButton style={{ padding: '2px'}}>
            <PlainText fontSize="min(1em, 4vw)" color='#B3B3B3'>
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
        {actions.map((action, index) => (
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
