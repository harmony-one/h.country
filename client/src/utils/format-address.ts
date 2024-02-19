export const removeSpacesAndSpecialChars = (str: string) => {
    return str.replace(/[\s~`!@#$%^&*(){};:"'<,.>?\\|_+=-]/g, '');
  }

export const formatAddress = (address?: string) => {
    let formattedAddress = address ? address.toLowerCase(): '';

    formattedAddress = removeSpacesAndSpecialChars(formattedAddress);

    return formattedAddress.slice(0, 20);
}