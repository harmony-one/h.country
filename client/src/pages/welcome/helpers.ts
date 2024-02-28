export const parseTagsFromUrl = (hashtagList: string): [string, number][] => {
    const topics = hashtagList.split(",");
    return topics.map((topic) => {
        const [tag, counter = "1"] = topic.split("^");
        return [tag, Number(counter) || 0];
    });
};