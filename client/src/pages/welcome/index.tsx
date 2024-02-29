/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box } from "grommet";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

import { addMessage, postUserTopics } from "../../api/firebase";
import { addMessageWithGeolocation } from "../../api";
import { getTopicLits } from "../../constants";
import { useUserContext } from "../../context/UserContext";
import { UserTopic } from "../../types";
import { parseTagsFromUrl } from "./helpers";
import { TopicsContainer, TopicItem, WelcomeContainer } from "./Components";

const TOPIC_SELECTED_TRIGGER = 3;

export const WelcomePage: React.FC = () => {
  // const { user } = useUser();
  const { wallet, firstTimeVisit } = useUserContext();

  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // const [isTopicsUpdating, setTopicsUpdating] = useState(true);
  const [topicList, setTopicList] = useState<UserTopic[]>();

  // const topicsQueryParam = searchParams.get('topics');

  const location = useLocation();
  const topicsQueryParam = location.search.substring(1);

  useEffect(() => {
    const getTopics = async () => {
      const topics = await getTopicLits();
      setTopicList(topics);
    };
    getTopics();
  }, []);

  useEffect(() => {
    const tagsTopic = async () => {
      const locationData = {
        latitude: null as number | null,
        longitude: null as number | null,
        address: "No Address",
      };
      if (wallet) {
        const addressWithoutPrefix = wallet.address.slice(2);
        const tags = selectedTopics; // firstTimeVisit ? [...selectedTopics, addressWithoutPrefix] : selectedTopics
        try {
          await Promise.all(
            tags.map(async (tag: string) =>
              await addMessageWithGeolocation(addressWithoutPrefix,
                `#${tag} @${addressWithoutPrefix}`))
          );
        } catch (e) {
          console.log(e);
        }
      }
    };

    if (selectedTopics.length >= TOPIC_SELECTED_TRIGGER && wallet?.address) {
      // setTopicsUpdating(true);
      tagsTopic().then(() => {
        postUserTopics(wallet.address, selectedTopics)
          .then(() => {
            // toast.success(`Added ${selectedTopics.length} topics!`, { autoClose: 10000 });
            navigate(`/0/${wallet.address.substring(2)}`);
          })
          .catch((e: any) => {
            toast.error(`Cannot add topics: ${e.message}`, {
              autoClose: 10000,
            });
          });
        // .finally(() => {
        //   setTopicsUpdating(false);
        // });
      });
    }
  }, [selectedTopics, wallet, wallet?.address, navigate, firstTimeVisit]);

  useEffect(() => {
    const processTopics = async () => {
      if (!topicsQueryParam || !wallet || !wallet.address) {
        return;
      }

      console.log("Set topics from query: ", topicsQueryParam);

      const parsedTags = parseTagsFromUrl(topicsQueryParam);
      const addressWithoutPrefix = wallet.address.substring(2);
      const locationData = {
        latitude: null,
        longitude: null,
        address: "No Address",
      };

      try {
        await Promise.all(
          parsedTags.map((tag: [string, number]) => {
            if (tag[1] > 1) {
              return addMessage({
                locationData,
                from: addressWithoutPrefix,
                text: `#${tag[0]} @${addressWithoutPrefix}`,
                customPayload: {
                  count: Math.min(tag[1], 99), // cap to 99 for each multi tag,
                  type: "multi_tag",
                },
              });
            } else {
              return addMessage({
                locationData,
                from: addressWithoutPrefix,
                text: `#${tag[0]} @${addressWithoutPrefix}`,
              });
            }
          })
        );
      } catch (error) {
        console.error(error);
      }
      navigate(`/0/${addressWithoutPrefix}`);
    };

    processTopics();
  }, [topicsQueryParam, wallet, navigate]);

  const handleTopicClick = (topic: UserTopic) => {
    const { name } = topic;

    setSelectedTopics((prevSelectedTopics) => {
      const isAlreadySelected = prevSelectedTopics.includes(name);
      if (isAlreadySelected) {
        return prevSelectedTopics.filter((t) => t !== name);
      }
      if (prevSelectedTopics.length < TOPIC_SELECTED_TRIGGER) {
        return [...prevSelectedTopics, name];
      }
      return prevSelectedTopics;
    });

    // if(!selectedTopics.includes(name)) {
    //   topicSelectedNotification(name)
    // } else {
    //   messageApi.destroy('topic')
    // }
  };

  const renderTopicsContainer = (group: number) => (
    <TopicsContainer>
      {topicList &&
        topicList
          .filter((topic) => topic.group === group)
          .map((topic) => (
            <TopicItem
              key={topic.name}
              topic={topic}
              isSelected={selectedTopics.includes(topic.name)}
              onClick={() => handleTopicClick(topic)}
            />
          ))}
    </TopicsContainer>
  );

  if (topicsQueryParam && wallet?.address) {
    return <Box></Box>;
  }

  return (
    <Box width={"700px"} margin={"0 auto"}>
      {/* <Spin spinning={isTopicsUpdating} size={"large"}> */}
      <WelcomeContainer>
        {[1, 2, 3].map((group) => (
          <Box key={group}>{renderTopicsContainer(group)}</Box>
        ))}
      </WelcomeContainer>
      {/* </Spin> */}
    </Box>
  );
};
