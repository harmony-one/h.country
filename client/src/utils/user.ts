const isSameAddress = (addr1: string, addr2: string): boolean => {
  return addr1.toLowerCase() === addr2.toLowerCase();
}

const isValidAddress = (key: string): boolean => {
  const hexRegExp = /^[0-9a-fA-F]+$/;
  return key.length === 40 && hexRegExp.test(key);
};

export { isSameAddress, isValidAddress };