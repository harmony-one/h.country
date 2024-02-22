/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box } from "grommet";
import { toast } from "react-toastify";
import { getTopicLits } from "../../constants";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { UserTopic } from "../../types";
import { Typography } from "antd"; // Spin
import { addMessage, postUserTopics } from "../../api/firebase";
import useDarkMode from "../../hooks/useDarkMode";

const TOPIC_SELECTED_TRIGGER = 3

const WelcomeContainer = styled(Box)`
  margin: 0 auto !important;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 2em;
  width: 100%;
  height: 100svh;
  /* background-color: #fff; */
`;

const TopicsContainer = styled(Box)`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(25%, 1fr));
  //gap: 16px;
  //padding: 16px;

  /* border: 1px solid black; */

  // Cells on the right side
  > div:nth-child(4n) {
    border-right: 0;
  }

  // Cells on the bottom
  > div:nth-child(n + 13) {
    border-bottom: 0;
  }

  @media only screen and (min-width: 768px) {
    max-width: 700px;
  }
`;

const TopicItemContainer = styled(Box) <{ isSelected?: boolean }>`
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-height: 100%;
  user-select: none;
  //box-shadow: rgba(0, 0, 0, 0.08) 0 4px 16px;
  box-shadow: none;
  border: 0; //1px solid black;
  //border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 250ms;
  /* ${(props) =>
    props.isSelected &&
    `
      box-shadow: 0px 0px 0px 4px #69fabd inset;
    `} */
`;

const TopicItemImage = styled.img<{ isDark?: Boolean }>`
  max-width: 50%;
  max-height: 50%;
  
  ${(props) => props.isDark ?
    `filter: invert(100%)
        sepia(92%) 
        saturate(1%) 
        hue-rotate(290deg) 
        brightness(105%) 
        contrast(101%);` : ''};
`;

const TopicItemAlias = styled(Box)`
  /* position: absolute;
  bottom: 2%; */
  text-align: center;
  /* right: 5%; */
`;

interface TopicItemProps {
  topic: UserTopic;
  isSelected: boolean;
  onClick: () => void;
}

const TopicItem = (props: TopicItemProps) => {
  const { topic, isSelected, onClick } = props;
  const [image, setImage] = useState(topic.light);
  const [showLabel, setShowLabel] = useState(true) // false

  const themeMode = useDarkMode()

  useEffect(() => {
    if (isSelected) {
      setImage(topic.color);
    } else {
      const logo = topic.light
      setImage(logo);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, themeMode]);

  const prefix = '' // "#"; // topic.type === 'blockchain' ? '$' : '#'

//   <TopicItemContainer isSelected={isSelected} onClick={onClick}>
// {/* {image && <TopicItemImage isDark={!isSelected && themeMode} src={image} alt={`${topic.name} logo`} onLoad={() => isSelected && setShowLabel(true)} />} */}
// <TopicItemAlias>
//   {isSelected && showLabel && (
//     <Typography.Text
//       style={{ fontSize: "min(2.4vw, 0.8rem)", fontWeight: 600 }}
//     >
//       {prefix}
//       {topic.name}
//     </Typography.Text>
//   )}
// </TopicItemAlias>
// </TopicItemContainer>

  return (
    <TopicItemContainer isSelected={isSelected} onClick={onClick}>
      {/* {image && <TopicItemImage isDark={!isSelected && themeMode} src={image} alt={`${topic.name} logo`} onLoad={() => isSelected && setShowLabel(true)} />} */}
      <TopicItemAlias>
        {showLabel && (
          <Typography.Text
            style={{ fontSize: "min(3.2vw, 1.1rem)", fontWeight: 600, color: isSelected ? '#64ebfd' : 'white' }}
          >
            {prefix}
            {topic.name}
          </Typography.Text>
        )}
      </TopicItemAlias>
    </TopicItemContainer>
  );
};

const parseTagsFromUrl = (hashtagList: string): [string, number][] => {
  const topics = hashtagList.split(",");
  return topics.map((topic) => {
    const [tag, counter = "1"] = topic.split("^");
    return [tag, Number(counter) || 0];
  });
};

export const WelcomePage: React.FC = () => {
  // const { user } = useUser();
  const { wallet, firstTimeVisit } = useUserContext();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // const [isTopicsUpdating, setTopicsUpdating] = useState(false);
  const [topicList, setTopicList] = useState<UserTopic[]>();

  const topicsQueryParam = searchParams.get('topics');

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
        const tags = firstTimeVisit ? [...selectedTopics, addressWithoutPrefix] : selectedTopics
        try {
          await Promise.all(tags.map((tag: string) => addMessage({
            locationData,
            from: addressWithoutPrefix,
            text: `#${tag} @${addressWithoutPrefix}`
          })));
        } catch (e) {
          console.log(e)
        }
      }
    }

    if (selectedTopics.length >= TOPIC_SELECTED_TRIGGER && wallet?.address) {
      // setTopicsUpdating(true);
      tagsTopic()
      .then(() => {
        postUserTopics(wallet.address, selectedTopics)
          .then(() => {
            // toast.success(`Added ${selectedTopics.length} topics!`, { autoClose: 10000 });
            navigate(`/0/${wallet.address.substring(2)}`);
          })
          .catch((e: any) => {
            toast.error(`Cannot add topics: ${e.message}`, { autoClose: 10000 });
          })
          // .finally(() => {
          //   setTopicsUpdating(false);
          // });
      })
    }
  }, [selectedTopics, wallet, wallet?.address, navigate, firstTimeVisit]);

  useEffect(() => {
    const processTopics = async () => {
      if (!topicsQueryParam || !wallet || !wallet.address) return;

      console.log('Set topics from query: ', topicsQueryParam);

      const parsedTags = parseTagsFromUrl(topicsQueryParam);
      const addressWithoutPrefix = wallet.address.substring(2);
      const locationData = {
        latitude: null,
        longitude: null,
        address: "No Address",
      };

      try {
        await Promise.all(parsedTags.map((tag: [string, number]) =>
          addMessage({
            locationData,
            from: addressWithoutPrefix,
            text: `#${tag[0]} @${addressWithoutPrefix}`,
            customPayload: tag[1] > 1 ? Math.min(tag[1], 99) : undefined, // cap to 99 for each multi tag
          })
        ));
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
      return  prevSelectedTopics;
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

  return (
    <Box
      width={'700px'}
      margin={'0 auto'}
    >
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
