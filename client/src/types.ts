export type UserTopicType = 'blockchain' | 'event' | 'nft' | 'dao' | 'protocol' | 'app'

export interface UserTopic {
  name: string
  type: UserTopicType
  light: any
  dark: any
  color: any
  group: number
}


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
