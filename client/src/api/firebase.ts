import { collection, getDocs, setDoc, doc, query, where, orderBy, addDoc, DocumentData, QueryDocumentSnapshot, limit, WhereFilterOp } from 'firebase/firestore';
import { db } from "../configs/firebase-config";
import { Action, AddressComponents, LocationData } from "../types";
import axios from "axios";
import { formatAddress } from '../utils';

export interface IFilter { fieldPath: string; opStr: WhereFilterOp; value: any; }

export const genFilter = (fieldPath: string, opStr: WhereFilterOp, value: any) => ({ fieldPath, opStr, value })

export const getMessages = async (filters: IFilter[] = []): Promise<Action[]> => {
  let data: QueryDocumentSnapshot<DocumentData, DocumentData>[] = []

  if (filters.length) {
    const res = await Promise.all(filters.map(async filter => {
      const q = query(
        collection(db, "actions"),
        orderBy("timestamp", "desc"),
        where(filter.fieldPath, filter.opStr, filter.value)
      );

      return (await getDocs(q)).docs;
    }))

    data = [].concat.apply([], res as any);
  } else {
    const q = query(
      collection(db, "actions"),
      orderBy("timestamp", "desc")
    );

    data = (await getDocs(q)).docs;
  }

  return data
    .map((doc) => ({ id: doc.id, data: doc.data() }))
    .filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.id === value.id)
    )
    .map((doc) => {
      const { data } = doc
      return {
        address: data.address,
        timestamp: data.timestamp,
        from: data.from,
        fromShort: data.from.substring(0, 4),
        payload: data.payload,
        to: data.to,
        toShort: typeof data.to === 'string' ? data.to.substring(0, 4) : '',
        type: data.type
      };
    })
    .filter((action) => ["tag", "link", "new_user", "location"].includes(action.type))
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
}

export const getLatestLocation = async (address: string): Promise<Action> => {
  const fromQuery = query(
    collection(db, "actions"),
    orderBy("address.road", "desc"),
    where('from', '==', address),
    where('address.road', '!=', ''),
    orderBy("timestamp", "desc"),
    limit(1)
  );

  const toSnapshot = await getDocs(fromQuery);

  const data = toSnapshot.docs[0]?.data();

  return data && {
    address: data.address,
    timestamp: data.timestamp,
    from: data.from,
    fromShort: data.from.substring(0, 4),
    payload: data.payload,
    to: data.to,
    toShort: typeof data.to === 'string' ? data.to.substring(0, 4) : '',
    type: data.type
  }
}

export const addMessage = async (params: {
  locationData: LocationData,
  from: string,
  text: string,
  customPayload?: any,
}) => {
  const { locationData, from, text, customPayload } = params;
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
  } else if (text.includes("location")) {
    type = "location";
    payload = customPayload || hashtags[0]
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
    to: mentions[0] || "",
    type: type,
    payload: payload,
    address: {
      short: formatAddress(addressComponents.road || ""),
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
