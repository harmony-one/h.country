export * from './getAddress/GetAddress'
export * from './social-url-parser'

export const shortenAddress = (address: string): string => {
  const start = address.substring(0, 4 + 2); // +2 to include '0x'
  const end = address.substring(address.length - 4);
  return start; // `${start}...${end}`;
}

export const capitalizeString = (str: string) => {
  if(str.length === 0) {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
