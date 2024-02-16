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
import axios from "axios";
import { HeaderList } from "./headerList";
import { UserAction } from "../../components/action";
import { addMessage, getMessages, getMessagesByKey } from "../../api/firebase";

interface LinkItem {
  id: string;
  text: JSX.Element;
}

interface Message {
  id: string;
  hashtags?: string[];
}

interface Action {
  timestamp: string;
  username: string;
  usernameShort: string;
  hashtag?: string;
  mention?: string;
  mentionShort?: string;
}
const isValid = (key: string): boolean => {
  const hexRegExp = /^[0-9a-fA-F]+$/;
  return key.length === 40 && hexRegExp.test(key);
};

export const handleSubmit = async (
  event: React.FormEvent,
  wallet: string,
  text: string
) => {
  event.preventDefault();
  let locationData = {
    latitude: null as number | null,
    longitude: null as number | null,
    address: "No location",
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const addressComponents = response.data.address;
          const formattedAddress = {
            house_number: addressComponents.house_number || "",
            road: addressComponents.road || "",
            city:
              addressComponents.city ||
              addressComponents.town ||
              addressComponents.village ||
              "",
            state: addressComponents.state || "",
            postcode: addressComponents.postcode || "",
            country: addressComponents.country || "",
          };
          locationData.latitude = position.coords.latitude;
          locationData.longitude = position.coords.longitude;
          locationData.address = `${formattedAddress.house_number} ${formattedAddress.road}, ${formattedAddress.city}, ${formattedAddress.state}, ${formattedAddress.postcode}, ${formattedAddress.country}`;
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

export const UserPage = (props: { id: string }) => {
  const { wallet } = useUserContext();
  const { id: key } = props;
  const [actions, setActions] = useState<Action[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "key" | null>('key');
  const [urls, setUrls] = useState<LinkItem[]>([]);
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setActions([])
      console.log('filterMode', filterMode)

      try {
        let items: Action[] = []
        if (filterMode === "all") {
          items = await getMessages();
        } else if (filterMode === "key" && key) {
          items = await getMessagesByKey(key);
        }
        setActions(items)
      } catch (e) {
        console.error('Failed to load messages:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filterMode, key]);

  const [tagItems, setTagItems] = useState<Array<{ content: ReactNode }>>([]);

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
                {`ig/${data[key].username}`}
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
    const messagesQuery = query(
      collection(db, "messages"),
      where("mentions", "array-contains", key)
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: Message[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Message[];

      const allHashtags = messages.flatMap((msg) => msg.hashtags || []);
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
  }, [wallet, key]);

  if (!key || !isValid(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  return (
    <Box>
      <Box>
        <HeaderList userId={key} isLoading={isLoading} type={"url"} items={urls.map(item => ({
          content: (
            <Box key={item.id}>
              <Text>{item.text}</Text>
            </Box>
          ),
        }))} wallet={wallet} />
        <HeaderList userId={key} isLoading={isLoading} type={"hashtag"} items={tagItems} wallet={wallet} />
      </Box>
      <Box>
        <Box direction={"row"} gap={"16px"}>
          <PlainButton
            onClick={() => setFilterMode("all")}
            style={{
              backgroundColor: filterMode === "all" ? "grey" : "initial",
            }}
          >
            All
          </PlainButton>
          <PlainButton
            onClick={() => setFilterMode("key")}
            style={{
              backgroundColor: filterMode === "key" ? "grey" : "initial",
            }}
          >
            {key?.substring(0, 4)}
          </PlainButton>
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
            <Text>No messages found</Text>
          </Box>
        }
        {actions.map((action, index) => (
          <UserAction key={index + action.timestamp} action={action} />
        ))}
      </Box>
    </Box>
  );
};
