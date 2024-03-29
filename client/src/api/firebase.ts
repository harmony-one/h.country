import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
  limit,
  WhereFilterOp,
  onSnapshot,
  Unsubscribe,
  startAfter
} from 'firebase/firestore';
import { db } from "../configs/firebase-config";
import { Action, AddressComponents, LocationData } from "../types";
import axios from "axios";
import { formatAddress } from '../utils';

export interface IFilter { fieldPath: string; opStr: WhereFilterOp; value: any; }

export const genFilter = (fieldPath: string, opStr: WhereFilterOp, value: any) => ({ fieldPath, opStr, value })

const formatMessages = (messages: QueryDocumentSnapshot[]) => {
  return messages
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
        type: data.type,
        id: doc.id,
        createdAt: data.createdAt
      };
    })
    .filter((action) => ["tag", "multi_tag", "link", "new_user", "location", "check-in"].includes(action.type))
    .filter((action) => action.type !== 'check-in' ||
      ((typeof action.payload === 'string' && action.payload !== 'check-in') || action.address?.short))
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
}

export interface GetMessagesParams {
  filters?: IFilter[][]
  updateCallback?: (actions: Action[]) => void
  size?: number,
  lastVisible?: QueryDocumentSnapshot
}

export const getMessages = async (params: GetMessagesParams = {}): Promise<{
  actions: Action[],
  unsubscribeList: Unsubscribe[],
  lastVisible: QueryDocumentSnapshot
}> => {
  const { filters = [], updateCallback, size = 100, lastVisible } = params
  let data: QueryDocumentSnapshot<DocumentData, DocumentData>[] = []

  const unsubscribeList = []
  if (filters.length) {
    const res = await Promise.all(filters.map(async filter => {
      let q = query(
        collection(db, "actions"),
        orderBy("timestamp", "desc"),
        limit(size)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible))
      }

      filter.forEach(f => q = query(q, where(f.fieldPath, f.opStr, f.value)))

      if (updateCallback && !lastVisible) {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          updateCallback(formatMessages(querySnapshot.docs))
        })
        unsubscribeList.push(unsubscribe)
      }

      return (await getDocs(q)).docs;
    }))

    data = [].concat.apply([], res as any);
  } else {
    let q = query(
      collection(db, "actions"),
      orderBy("timestamp", "desc"),
      limit(size)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible))
    }

    if (updateCallback && !lastVisible) {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        updateCallback(formatMessages(querySnapshot.docs))
      })
      unsubscribeList.push(unsubscribe)
    }

    data = (await getDocs(q)).docs;
  }

  return {
    actions: formatMessages(data),
    unsubscribeList,
    lastVisible: data[data.length - 1]
  }
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
    type: data.type,
    id: toSnapshot.docs[0].id
  }
}

export const addMessage = async (params: {
  locationData: LocationData,
  from: string,
  text: string,
  customPayload?: any,
}) => {
  const { locationData, from, text, customPayload = {} } = params;
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
  let payload: any = text;
  let to = mentions[0] || ""

  const urlRegex = /https?:\/\/[^\s]+/;
  const urlMatch = text.match(urlRegex);

  // TODO: pass "type" param directly from components
  if (urlMatch) {
    type = "link";
    payload = urlMatch[0];
  } else if (text.includes("location")) {
    type = "location";
    payload = customPayload || hashtags[0]
  } else if (text.includes("check-in")) {
    type = "check-in";
    payload = customPayload
  } else if (text.includes("new_user")) {
    type = "new_user";
    payload = customPayload
  } else if (mentions.length > 0 && hashtags.length > 0) {
    if (customPayload.type && customPayload.type === "multi_tag") {
      type = "multi_tag";
      payload = {
        "tag": hashtags[0],
        "count": customPayload.count,
      };
    } else {
      type = "tag";
      payload = hashtags[0]
    }
  }

  let action = {
    from,
    to,
    type,
    payload,
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
