import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {Box, Button, Spinner, Text} from "grommet";
import {PlainButton} from "../../components/button";
import {useUserContext} from "../../context/UserContext";
import {collection, doc, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../configs/firebase-config";
import {HeaderList} from "./headerList";
import {UserAction} from "../../components/action";
import {isSameAddress, isValidAddress} from "../../utils/user";
import {formatAddress, linkToMapByAddress} from "../../utils";
import styled from "styled-components";
import {useSearchParams} from "react-router-dom";
import { addMessageWithGeolocation } from "../../api";
import { useActionsContext } from "../../context";

const HeaderText = styled(Text)`
  font-size: min(1em, 3vw);
`
const SmallHeaderText = styled(Text)`
  font-size: min(0.8em, 2.5vw);
  line-height: 2.3em;

  @media only screen and (min-width: 380px) {
    line-height: 2em;
  }

  @media only screen and (min-width: 450px) {
    line-height: 1em;
  }
`

const predefinedLinks = [
  { key: 'x', displayText: 'Twitter' },
  { key: 'ig', displayText: 'Instagram' },
  { key: 'g', displayText: 'Github' },
];

interface LinkItem {
  id: string;
  text: JSX.Element;
}

interface Message {
  id: string;
  payload?: string[];
}

const parseTagsFromUrl = (hashtagList: string): [string, number][] => {
  const topics = hashtagList.split(',')
  return topics.map(topic => {
    const [tag, counter = '1'] = topic.split('^')
    return [
      tag,
      Number(counter) || 0
    ]
  })
}

function isHex(num: string): Boolean {
  return Boolean(num.match(/^0x[0-9a-f]+$/i)) || Boolean(`0x${num}`.match(/^0x[0-9a-f]+$/i))
}
export const UserPage = (props: { id: string }) => {
  const { wallet } = useUserContext();
  const { id: key } = props;
  const [urls, setUrls] = useState<LinkItem[]>([]);
  const [isUserPage, setIsUserPage] = useState(false);
  const [tagItems, setTagItems] = useState<Array<{ content: ReactNode }>>([]);
  const [searchParams] = useSearchParams();
  const topicsQueryParam = searchParams.get('topics')
  const { 
    actions, 
    filters, 
    setFilters,
    filterMode, 
    setFilterMode, 
    DefaultFilterMode,
    isLoading 
  } = useActionsContext();

  useEffect(() => {
    if (!key) return;
    const docRef = doc(db, "userLinks", key);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
  
        let linkItems: LinkItem[] = predefinedLinks.map(({ key, displayText }) => {
          // Check if the key exists in the fetched data
          if (data[key] && data[key].username && data[key].url) {
            return {
              id: docSnap.id + key,
              text: (
                <a href={data[key].url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
                  {`${key}/${data[key].username}`}
                </a>
              ),
            };
          } else {
            // Return a default link item with the display text if the key does not exist
            return {
              id: docSnap.id + key,
              text: <Text>{displayText}</Text>,
            };
          }
        });
  
        setUrls(linkItems);
      } else {
        console.log("No such document!");
        // Here you can handle the case where there are no user links at all
        setUrls(predefinedLinks.map(({ key, displayText }) => ({
          id: 'default' + key,
          text: <Text>{displayText}</Text>,
        })));
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

      const tagsFromUrl = parseTagsFromUrl(topicsQueryParam || '')
      console.log('Tags from Url: ', tagsFromUrl)

      const tagsList = tagsFromUrl.length ? tagsFromUrl : Object.entries(hashtagFrequency)

      const sortedHashtags = tagsList
        .sort((a, b) => b[1] - a[1])
        .slice(0, 9)
        .map(([hashtag, count]) => ({
          content: (
            <Button key={hashtag} onClick={
              async (e) => {
                e.preventDefault();

                if (wallet !== undefined && key !== undefined) {
                  const addressWithoutPrefix = wallet.address.slice(2);
                  await addMessageWithGeolocation(addressWithoutPrefix, `#${hashtag} @${key}`);
                } else {
                  console.log("Invalid user wallet");
                }
              }}
              plain>
              <Box direction={"row"} key={hashtag}>
                <HeaderText>{isHex(hashtag) ? `0/${hashtag.substring(0, 4)}` : hashtag}</HeaderText>
                <SmallHeaderText>{count}</SmallHeaderText>
              </Box>
            </Button>
          ),
        })
        );

      setTagItems(sortedHashtags);
    });

    return () => unsubscribe();
  }, [wallet, key, filters.length, topicsQueryParam]);

  const extendedUrls = useMemo<LinkItem[]>(() => {
    const latestLocation = actions.find(
      a => a.from === wallet?.address.slice(2) && !!a.address.road
    )?.address;

    if (!latestLocation?.road) {
      return urls;
    }

    return [{
      id: 'latest_location' + latestLocation?.postcode,
      text: (
        <a
          href={linkToMapByAddress(latestLocation)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', textDecoration: 'none' }}
        >
          {`m/${latestLocation?.short || formatAddress(latestLocation?.road)}`}
        </a>
      )
    }, ...urls]
  }, [actions, urls, wallet?.address])

  if (!key || !isValidAddress(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  const onTagClicked = (hashtag: string) => {
    if (!filters.find(item => item.value === hashtag)) {
      setFilters([...filters, {
        type: 'hashtag',
        value: hashtag
      }])
      setFilterMode('hashtag')
    }
  }

  const headersListProps = {
    userId: key,
    isLoading,
    isUserPage,
    wallet
  }

  return (
    <Box>
      <Box>
        <HeaderList
          {...headersListProps}
          type={"url"}
          items={extendedUrls.map(item => ({
            content: (
              <Box key={item.id}>
                <HeaderText>{item.text}</HeaderText>
              </Box>
            ),
          }))}
        />
        <HeaderList
          {...headersListProps}
          type={"hashtag"}
          items={tagItems}
        />
      </Box>
      <Box pad={'0 16px'}>
        <Box direction={"row"} gap={"16px"}>
          <PlainButton
            isActive={filterMode === "all"}
            onClick={() => setFilterMode("all")}
          >
            All
          </PlainButton>
          <PlainButton
            isActive={filterMode === "address"}
            onClick={() => setFilterMode("address")}
          >
            <Text color={isUserPage ? "blue1" : "yellow1"}>
              {key?.substring(0, 4)}
            </Text>
          </PlainButton>
          {filters.map(filter => {
            const { value } = filter
            const onClick = () => {
              const newFilters = filters.filter(item => item.value !== value)
              setFilters(newFilters)
              if (newFilters.length === 0) {
                setFilterMode(DefaultFilterMode)
              }
            }

            return <PlainButton
              key={value}
              isActive={filters.length > 0}
              onClick={onClick}
            >
              <Text color={isUserPage ? "blue1" : "yellow1"}>
                #{value}
              </Text>
            </PlainButton>
          })}
        </Box>
      </Box>
      <Box margin={{ top: '16px' }}>
        {isLoading &&
          <Box align={'center'}>
            <Spinner color={'spinner'} />
          </Box>
        }
        {!isLoading && actions.length === 0 &&
          <Box align={'center'}>
            <Text>No actions found</Text>
          </Box>
        }
        {actions.map((action, index) => (
          <UserAction
            userId={key}
            key={index + action.timestamp}
            action={action}
            onTagClicked={onTagClicked}
          />
        ))}
      </Box>
    </Box>
  );
};
