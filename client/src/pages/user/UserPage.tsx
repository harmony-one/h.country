import React, { ReactNode, useState, useEffect } from "react";
import { Box, Button, Spinner, Text } from "grommet";
import { PlainButton } from "../../components/button";
import { useUserContext } from "../../context/UserContext";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc
} from "firebase/firestore";
import { db } from "../../configs/firebase-config";
import { HeaderList } from "./headerList";
import { UserAction } from "../../components/action";
import { addMessage, getMessages } from "../../api/firebase";
import { isSameAddress, isValidAddress } from "../../utils/user";
import {ActionFilter, ActionFilterType} from "../../types";

interface LinkItem {
  id: string;
  text: JSX.Element;
}

interface Message {
  id: string;
  payload?: string[];
}

interface Action {
  timestamp: string;
  from: string;
  to?: string;
  type: string;
  payload?: string;
  // address import address thing
  toShort?: string;
  fromShort: string;
}

export const handleSubmit = async (
  event: React.FormEvent | undefined,
  wallet: string,
  text: string
) => {
  if (event) {
    event.preventDefault();
  }
  let locationData = {
    latitude: null as number | null,
    longitude: null as number | null,
    address: "No Address",
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          locationData.latitude = position.coords.latitude;
          locationData.longitude = position.coords.longitude;
        } catch (error) {
          console.error("Error fetching address: ", error);
        } finally {
          await addMessage(locationData, wallet, text);
        }
      },
      async () => {
        await addMessage(locationData, wallet, text);
      }
    );
  } else {
    console.error("Geolocation is not supported by your browser");
    await addMessage(locationData, wallet, text);
  }
};

const DefaultFilterMode: ActionFilterType = 'address'

export const UserPage = (props: { id: string }) => {
  const { wallet } = useUserContext();
  const { id: key } = props;
  const [actions, setActions] = useState<Action[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "address" | "hashtag">(DefaultFilterMode);
  const [urls, setUrls] = useState<LinkItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isUserPage, setIsUserPage] = useState(false);
  const [tagItems, setTagItems] = useState<Array<{ content: ReactNode }>>([]);
  const [filters, setFilters] = useState<ActionFilter[]>([])

  useEffect(() => {
    // Drop sub-filters if user select All of <Address> filter
    if(filterMode !== 'hashtag') {
      setFilters([])
    }
  }, [filterMode]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setActions([])

      try {
        let items: Action[]
        let actionFilters: ActionFilter[] = []
        if (filterMode === "address" && key) {
          actionFilters.push({
            type: 'address',
            value: key
          })
        } else if(filterMode === 'hashtag' && filters.length > 0) {
          const [{ value }] = filters
          actionFilters.push({
            type: 'hashtag',
            value: value
          })
        }
        console.log('Fetching actions...', actionFilters)
        items = await getMessages(actionFilters);
        setActions(items)
        console.log('Actions loaded:', items)
      } catch (e) {
        console.error('Failed to load messages:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filterMode, key, filters.length]);

  useEffect(() => {
    if (!key) return;
    const docRef = doc(db, "userLinks", key);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        let linkItems: LinkItem[] = Object.keys(data)
          .filter(key => data[key].username && data[key].url)
          .map(key => ({
            id: docSnap.id + key,
            text: (
              <a href={data[key].url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
                {`${key}/${data[key].username}`}
              </a>
            )
          }));

        setUrls(linkItems);
      } else {
        console.log("No such document!");
        setUrls([]);
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

      const sortedHashtags = Object.entries(hashtagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hashtag, count]) => ({
          content: (
            <Button key={hashtag} onClick={
              async (e) => {
                e.preventDefault();
                if (wallet !== undefined && key !== undefined) {
                  const addressWithoutPrefix = wallet.address.slice(2);
                  await handleSubmit(e, addressWithoutPrefix, `#${hashtag} @${key}`);
                } else {
                  console.log("Invalid user wallet");
                }
              }}
              plain>
              <Box direction={"row"} key={hashtag}>
                <Text>{hashtag}</Text>
                <Text size={"xsmall"}>{count}</Text>
              </Box>
            </Button>
          ),
        })
        );

      setTagItems(sortedHashtags);
    });

    return () => unsubscribe();
  }, [wallet, key, filters.length]);

  if (!key || !isValidAddress(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  const onTagClicked = (hashtag: string) => {
    if(!filters.find(item => item.value === hashtag)) {
      setFilters([...filters, {
        type: 'hashtag',
        value: hashtag
      }])
      setFilterMode('hashtag')
    }
  }

  return (
    <Box>
      <Box>
        <HeaderList userId={key} isLoading={isLoading} isUserPage={isUserPage} type={"url"} items={urls.map(item => ({
          content: (
            <Box key={item.id}>
              <Text>{item.text}</Text>
            </Box>
          ),
        }))} wallet={wallet} />
        <HeaderList userId={key} isLoading={isLoading} isUserPage={isUserPage} type={"hashtag"} items={tagItems} wallet={wallet} />
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
              if(newFilters.length === 0) {
                setFilterMode(DefaultFilterMode)
              }
            }

            return <PlainButton
              isActive={filters.length > 0}
              onClick={onClick}
            >
              <Text color={isUserPage ? "blue1" : "yellow1"}>
                {value}
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
            key={index + action.timestamp}
            action={action}
            onTagClicked={onTagClicked}
          />
        ))}
      </Box>
    </Box>
  );
};
