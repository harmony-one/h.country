import React, { ReactNode, useState, useEffect } from "react";
import { Box, Button, Text, TextInput } from "grommet";
import { PlainButton } from "../../components/button";
import { useUserContext } from "../../context/UserContext";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../configs/firebase-config";
import axios from "axios";
import { HeaderList } from "./headerList";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface LinkItem {
  id: number;
  text: string;
  isEditing: boolean;
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
  console.log(wallet, text);
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

const addMessage = async (
  locationData: LocationData,
  username: string,
  text: string
) => {
  const timestamp = new Date().toISOString();

  const duplicateCheckQuery = query(
    collection(db, "messages"),
    where("username", "==", username),
    where("text", "==", text)
  );

  const duplicateCheckSnapshot = await getDocs(duplicateCheckQuery);

  if (!duplicateCheckSnapshot.empty) {
    window.alert("Duplicate message detected. No duplicate messages allowed.");
    return;
  }

  const mentions = [...text.matchAll(/@(\w+)/g)].map((match) => match[1]);
  const hashtags = [...text.matchAll(/#(\w+)/g)].map((match) => match[1]);

  let message = {
    username: username || "Anonymous",
    text,
    timestamp,
    address: locationData.address,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    mentions,
    hashtags,
  };

  try {
    await addDoc(collection(db, "messages"), message);
  } catch (error) {
    console.error("Could not send the message: ", error);
  }
};

export const UserPage = () => {
  const { wallet } = useUserContext();
  const { key } = useParams();
  const [actions, setActions] = useState<Action[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "key" | null>(null);

  const [linkItems, setLinkItems] = useState<LinkItem[]>([
    { id: 1, text: "𝕏/", isEditing: false },
    { id: 2, text: "t/", isEditing: false },
    { id: 3, text: "ig/", isEditing: false },
    { id: 4, text: "l/", isEditing: false },
    { id: 5, text: "d/", isEditing: false },
  ]);

  const toggleEdit = (id: number) => {
    const walletKey = wallet?.address?.toLowerCase() ?? "";
    const paramKey = key?.toLowerCase() ?? "foo";

    if (walletKey.includes(paramKey)) {
      setLinkItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, isEditing: !item.isEditing } : item
        )
      );
    } else {
      alert("You can only edit items when your wallet matches the user ID in the URL.");
    }
  };

  const updateText = (id: number, text: string) => {
    setLinkItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, text: text, isEditing: false } : item
      )
    );
  };

  const renderedLinkItems = linkItems.map((item) => ({
    content: item.isEditing ? (
      <TextInput
        autoFocus
        defaultValue={item.text}
        onBlur={() => toggleEdit(item.id)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            updateText(item.id, e.currentTarget.value);
          }
        }}
      />
    ) : (
      <Text onClick={() => toggleEdit(item.id)} style={{ cursor: 'pointer' }}>{item.text}</Text>
    ),
  }));

  useEffect(() => {
    const fetchAllMessages = async () => {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const formattedMessages = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const date = new Date(data.timestamp);
          const formattedTimestamp = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).replace(",", "").replace(/([AP]M)$/, " $1");

          return {
            timestamp: formattedTimestamp,
            username: data.username,
            usernameShort: data.username.substring(0, 4),
            hashtag: data.hashtags?.[0],
            mention: data.mentions?.[0],
            mentionShort: data.mentions?.[0]?.substring(0, 4),
          };
        })
        .filter((action) => action.mention && action.hashtag);

      setActions(formattedMessages);
    };

    const fetchMessagesByKey = async (key: string) => {
      const mentionsQuery = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc"),
        where("mentions", "array-contains", key)
      );
      const mentionsSnapshot = await getDocs(mentionsQuery);

      const usernameQuery = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc"),
        where("username", "==", key)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      const combinedActions = [
        ...mentionsSnapshot.docs,
        ...usernameSnapshot.docs,
      ]
        .map((doc) => ({ id: doc.id, data: doc.data() }))
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        )
        .map((doc) => {
          const data = doc.data;
          const date = new Date(data.timestamp);
          const formattedTimestamp = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).replace(',', '').replace(/([AP]M)$/, ' $1');

          return {
            timestamp: formattedTimestamp,
            username: data.username,
            usernameShort: data.username.substring(0, 4),
            hashtag: data.hashtags?.[0],
            mention: data.mentions?.[0],
            mentionShort: data.mentions?.[0]?.substring(0, 4),
          };
        })
        .filter((action) => action.mention && action.hashtag);

      setActions(combinedActions);
    };

    if (filterMode === "all") {
      fetchAllMessages();
    } else if (filterMode === "key" && key) {
      fetchMessagesByKey(key);
    }
  }, [filterMode, key]);

  const [tagItems, setTagItems] = useState<Array<{ content: ReactNode }>>([]);

  useEffect(() => {
    console.log(key);
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
                if (wallet !== undefined) {
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

      console.log(sortedHashtags);

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
      <HeaderList title={"/"} items={renderedLinkItems} wallet={wallet} />
        <HeaderList title={"#"} items={tagItems} wallet={wallet} />
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
      <Box>
      {actions.map((action, index) => (
        <Box key={index} border={{ side: "bottom" }} pad={"4px 0"}>
          <Text size={"small"}>
  {action.timestamp} - {" "}
  <Link className="link" to={`/0/${action.username}`}>0/{action.usernameShort}</Link>
  {" tags #"}
  {action.hashtag}
  {" on "}
  <Link className="link" to={`/0/${action.mention}`}>0/{action.mentionShort}</Link>
</Text>
        </Box>
      ))}
    </Box>
    </Box>
  );
};
