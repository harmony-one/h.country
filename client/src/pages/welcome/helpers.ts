import { isPrivateKey } from "../../utils/getAddress/validators";

export const parseTagsFromUrl = (hashtagList: string): [string, number][] => {
    if (isPrivateKey(hashtagList)) {
        return []
    }
    const topics = hashtagList.split(",");
    return topics.map((topic) => {
        const [tag, counter = "1"] = topic.split("^");
        return [tag, Number(counter) || 0];
    });
};