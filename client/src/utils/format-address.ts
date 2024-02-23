export const removeSpacesAndSpecialChars = (str: string) => {
    return str.replace(/[\s~`!@#$%^&*(){};:"'<,.>?\\|_+=-]/g, '');
}

export const formatAddress = (address?: string) => {
    let formattedAddress = address ? address.toLowerCase() : '';

    formattedAddress = removeSpacesAndSpecialChars(formattedAddress);

    return formattedAddress.slice(0, 20);
}

export const linkToMapByAddress = (latestLocation: string) => {
    const place = (latestLocation || '').replace(/ /g, '+')
    return `https://www.google.ca/maps/place/${place}`
    // const hrefToMap = `https://www.google.com/maps/search/?api=1&query=${latestLocation.lattitude},${latestLocation.longitude}`
}