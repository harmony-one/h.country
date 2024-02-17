import { collection, getDocs, setDoc, doc, query, where, orderBy, addDoc } from 'firebase/firestore';
import { db } from "../configs/firebase-config";
import { Action, AddressComponents, LocationData } from "../types";
import axios from "axios";

export const getMessages = async (): Promise<Action[]> => {
  const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
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
        text: data.text,
      };
    })
    .filter((action) => (action.mention && action.hashtag)
      || action.text === "new user joined")
}

export const getMessagesByKey = async (key: string): Promise<Action[]> => {
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

  return [
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
        text: data.text,
      };
    })
    .filter((action) => (action.mention && action.hashtag)
      || action.text === "new user joined")
};

export const addMessage = async (
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
    if (!text.includes("https://")) {
      window.alert("Duplicate message detected. No duplicate messages allowed.");
      return;
    }
  }

  let addressComponents: AddressComponents = {};
  if (locationData.latitude && locationData.longitude) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}`
      );
      addressComponents = response.data.address;
    } catch (error) {
      console.error("Error fetching address: ", error);
    }
  }

  const mentions = [...text.matchAll(/@(\w+)/g)].map((match) => match[1]);
  const hashtags = [...text.matchAll(/#(\w+)/g)].map((match) => match[1]);
  let type: string = "message";

  const urlRegex = /https?:\/\/[^\s]+/;
  if (urlRegex.test(text)) {
    type = "link";
  } else if (text.includes("check-in")) {
    type = "check-in";
  } else if (text.includes("new_user")) {
    type = "new_user";
  } else if (mentions.length > 0 && hashtags.length > 0) {
    type = "tag";
  }

  let action = {
    from: username,
    to: mentions[0],
    type: type,
    payload: text,
    address: {
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
    },
    timestamp: timestamp,
  };

  try {
    await addDoc(collection(db, "actions"), action);
  } catch (error) {
    console.error("Could not send the message: ", error);
  }
};

export const postUserTopics = async (address: string, topics: string[]) => {
  return await setDoc(doc(db, "users", address), {
    ...topics,
    created: Math.floor(Date.now() / 1000)
  });
}

export const getUserBySocial = async (filter: { key: string, value: string }): Promise<any[]> => {
  const mentionsQuery = query(
    collection(db, "userLinks"),
    where(filter.key, "==", filter.value)
  );
  const mentionsSnapshot = await getDocs(mentionsQuery);

  return mentionsSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
};