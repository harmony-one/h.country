export type UserTopicType = 'blockchain' | 'event' | 'nft' | 'dao' | 'protocol' | 'app'

export interface UserTopic {
  name: string
  type: UserTopicType
  light: any
  dark?: any
  color: any
  group: number
}


export interface Action {
  timestamp: string;
  from: string;
  to?: string;
  type: string;
  payload?: string;
  // address import address thing
  toShort?: string;
  fromShort: string;
}

export interface AddressComponents {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  addressComponents?: AddressComponents;
}

export type ActionFilterType = 'all' | 'address' | 'hashtag'

export interface ActionFilter {
  type: ActionFilterType
  value: string
}

