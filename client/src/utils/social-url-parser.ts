import { regexes } from "../components/links";

// function removeEmpty<T>(object: any): T {
//     for (const key of Object.keys(object)) {
//         if (object[key] && typeof object[key] === 'object') {
//             removeEmpty(object[key]);
//         } else if (object[key] === undefined) delete object[key];
//     }
//     return object;
// }

export interface ParseResult {
    /** which social media site was selected */
    type: string;
    /** the formatted name of the site */
    providerName: string;
    /** the username found in the url */
    username: string;
    /** the url in which the username was found */
    url: string;
    /** deprecation warning of the site */
    deprecated?: boolean;
}

export function socialUrlParser(input: string, providerName: string): ParseResult | null {
    const regexObject = regexes.find(regex => regex.providerName === providerName);
    if (!regexObject) {
        return null;
    }

    const isUrl = /^https?:\/\//.test(input);
    if (isUrl) {
        const inputDomain = new URL(input).hostname;
        const baseDomain = new URL(regexObject.baseUrl).hostname;
        if (inputDomain !== baseDomain) {
            return null;
        }
    }
    let url = input;
    if (!isUrl) {
        if (providerName === 'substack') {
            url = `https://${input}.substack.com`;
        } else if (regexObject.baseUrl) {
            url = regexObject.baseUrl + input;
        }
    }

    const result = regexObject.regex.exec(url);
    if (!result) {
        return null;
    }
    const username = result[result.length - 1];
    if (!username) {
        return null;
    }
    const parseResult: ParseResult = {
        type: regexObject.type,
        providerName: providerName,
        url: isUrl ? result[0] : url, // Use the constructed URL for usernames
        username: username,
    };

    return parseResult;
}
