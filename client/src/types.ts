export interface Action {
  timestamp: string;
  username: string;
  usernameShort: string;
  hashtag?: string;
  mention?: string;
  mentionShort?: string;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  address: string;
}
