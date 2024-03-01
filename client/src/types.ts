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
  payload?: any;
  address: AddressComponents;
  toShort?: string;
  fromShort: string;
  id: string;
}

export interface AddressComponents {
  house_number?: string;
  road?: string;
  short?: string;
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

export type ActionFilterMode = 'all' | 'address'
export type ActionFilterType = 'hashtag' | 'location'

export interface ActionFilter {
  type: ActionFilterType
  value: string
}
