import { collection, getDocs, setDoc, doc, query, where, orderBy, addDoc } from 'firebase/firestore';
import { db } from "../configs/firebase-config";
import { Action, AddressComponents, LocationData } from "../types";
import axios from "axios";

export const getMessages = async (): Promise<Action[]> => {
  const q = query(collection(db, "actions"), orderBy("timestamp", "desc"));
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
        from: data.from,
        fromShort: data.from.substring(0, 4),
        payload: data.payload,
        to: data.to,
        toShort: typeof data.to === 'string' ? data.to.substring(0, 4) : '',
        type: data.type
      };
    })
    .filter((action) => action.type === "tag"
      || action.type === "new_user")
}

export const getMessagesByKey = async (key: string): Promise<Action[]> => {
  const mentionsQuery = query(
    collection(db, "actions"),
    orderBy("timestamp", "desc"),
    where("payload", "array-contains", key)
  );
  const mentionsSnapshot = await getDocs(mentionsQuery);

  const usernameQuery = query(
    collection(db, "actions"),
    orderBy("timestamp", "desc"),
    where("from", "==", key)
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
        from: data.from,
        fromShort: data.from.substring(0, 4),
        payload: data.payload?.[0],
        to: data.to,
        toShort: typeof data.to === 'string' ? data.to.substring(0, 4) : '',
        type: data.type
      };
    })
    .filter((action) => action.type === "tag"
      || action.type === "new_user")
};

export const addMessage = async (
  locationData: LocationData,
  from: string,
  text: string
) => {
  const timestamp = new Date().toISOString();

  // TODO: Conditional check based on determined type
  // const duplicateCheckQuery = query(
  //   collection(db, "actions"),
  //   where("from", "==", from),
  //   where("payload", "==", payload)
  // );

  // const duplicateCheckSnapshot = await getDocs(duplicateCheckQuery);

  // if (!duplicateCheckSnapshot.empty) {
  //   if (!text.includes("https://")) {
  //     window.alert("Duplicate message detected. No duplicate messages allowed.");
  //     return;
  //   }
  // }

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
  let payload: string = text;

  const urlRegex = /https?:\/\/[^\s]+/;
  const urlMatch = text.match(urlRegex);
  if (urlMatch) {
    type = "link";
    payload = urlMatch[0];
  } else if (text.includes("check-in")) {
    type = "check-in";
  } else if (text.includes("new_user")) {
    type = "new_user";
  } else if (mentions.length > 0 && hashtags.length > 0) {
    type = "tag";
    payload = hashtags[0]
  }

  let action = {
    from: from,
    to: mentions[0],
    type: type,
    payload: payload,
    address: {
      lattitude: locationData.latitude || "",
      longitude: locationData.longitude || "",
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