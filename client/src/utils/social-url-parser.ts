import { regexes, RegexObject } from "../components/links";
import { getFirestore, doc, getDoc } from "firebase/firestore";


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

function isLikelyURL(input: string) {
    return /^https?:\/\//.test(input) ||
           /^www\./.test(input) ||
           /\.[a-z]{2,15}($|\/)/i.test(input);
}

function normalizeInput(input: string) {
    if (!/^https?:\/\//i.test(input)) {
        return `http://${input}`;
    }
    return input;
}

function generateUUID() {
    return crypto.randomUUID();
}


function extractUsernameFromURL(input: string) {
    const url = new URL(normalizeInput(input));
    const hostnameParts = url.hostname.split('.').filter(part => part !== 'www');
    const pathAndQuery = url.pathname !== '/' ? url.pathname : '' + url.search;
    let username;

    if (!pathAndQuery) {
        username = hostnameParts.join('.');
    } else {
        username = `${hostnameParts.slice(0, -1).join('.')}${pathAndQuery}`;
    }

    return username;
}

function extractUsernameForProvider(input: string) {
    const url = new URL(normalizeInput(input));
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    const username = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
    return username;
}

export function socialUrlParser(input: string, providerName: string): ParseResult | null {
    const isUrl = isLikelyURL(input);
    const uuid = generateUUID()
    
    if (providerName === "any") {
        if (isUrl) {
            const normalizedInput = normalizeInput(input);

            let matchedProvider: RegexObject | undefined = regexes.find(regex => {
                const baseUrlDomain = new URL(regex.baseUrl).hostname.replace(/^www\./, '');
                const inputDomain = new URL(normalizedInput).hostname.replace(/^www\./, '');
                return inputDomain === baseUrlDomain || inputDomain.endsWith('.' + baseUrlDomain);
            });
            

            if (matchedProvider) {
                const username = extractUsernameForProvider(normalizedInput);
                return {
                    type: matchedProvider.type,
                    providerName: matchedProvider.providerName,
                    url: normalizedInput,
                    username: username,
                };
            } else {
                const username = extractUsernameFromURL(normalizedInput);
                return {
                    type: uuid,
                    providerName: uuid,
                    url: normalizedInput,
                    username: username,
                };
            }
        } else {
            return {
                type: uuid,
                providerName: uuid,
                url: `https://www.google.com/search?q=${encodeURIComponent(input)}`,
                username: input,
            };
        }
    } else {
        const regexObject = regexes.find(regex => regex.providerName === providerName);
        if (!regexObject) return null;

        const normalizedInput = normalizeInput(input);
        regexObject.regex.lastIndex = 0;
        const result = regexObject.regex.exec(normalizedInput);
        if (!result) return null;

        return {
            type: regexObject.type,
            providerName: regexObject.providerName,
            url: normalizedInput,
            username: result[result.length - 1],
        };
    }
}