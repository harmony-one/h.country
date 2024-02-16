import React, { useState, useEffect } from "react";
import { Box } from "grommet";
import { toast } from "react-toastify";
import { getTopicLits } from "../../constants";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { UserTopic } from "../../types";
import { Typography, Spin } from "antd";
import {postUserTopics} from "../../api/firebase";

const WelcomeContainer = styled(Box)`
  margin: 0 auto !important;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 2em;
  width: 100%;
  height: 95vh;
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

const TopicItemContainer = styled(Box)<{ isSelected?: boolean }>`
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

  // &:hover {
  //     transform: scale(1.04);
  // }

  /* ${(props) =>
  props.isSelected &&
  `
      box-shadow: 0px 0px 0px 4px #69fabd inset;
    `} */
`;

const TopicItemImage = styled.img`
  max-width: 50%;
  max-height: 50%;
`;

const TopicItemAlias = styled(Box)`
  position: absolute;
  bottom: 5%;
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
  const [image, setImage] = useState(topic.logoOutline);

  useEffect(() => {
    if (isSelected) {
      setImage(topic.logo);
    } else {
      setImage(topic.logoOutline);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const prefix = "#"; // topic.type === 'blockchain' ? '$' : '#'
  return (
    <TopicItemContainer isSelected={isSelected} onClick={onClick}>
      {image && <TopicItemImage src={image} alt={`${topic.name} logo`} />}
      <TopicItemAlias>
        {isSelected && (
          <Typography.Text
            style={{ fontSize: "min(2.4vw, 0.8rem)", fontWeight: 600 }}
          >
            {prefix}
            {topic.name}
          </Typography.Text>
        )}
      </TopicItemAlias>
    </TopicItemContainer>
  );
};

export const WelcomePage: React.FC = () => {
  // const { user } = useUser();
  const { wallet } = useUserContext();

  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isTopicsUpdating, setTopicsUpdating] = useState(false);
  const [topicList, setTopicList] = useState<UserTopic[]>();

  useEffect(() => {
    const getTopics = async () => {
      const topics = await getTopicLits();
      setTopicList(topics);
    };
    getTopics();
  }, []);

  useEffect(() => {
    if (selectedTopics.length === 4 && wallet?.address) {
      setTopicsUpdating(true);
      postUserTopics(wallet.address, selectedTopics)
        .then(() => {
          // toast.success(`Added ${selectedTopics.length} topics!`, { autoClose: 10000 });
          navigate("/");
        })
        .catch((e: any) => {
          toast.error(`Cannot add topics: ${e.message}`, { autoClose: 10000 });
        })
        .finally(() => {
          setTopicsUpdating(false);
        });
    }
  }, [selectedTopics, wallet?.address, navigate]);

  const handleTopicClick = (topic: UserTopic) => {
    const { name } = topic;

    setSelectedTopics((prevSelectedTopics) => {
      const isAlreadySelected = prevSelectedTopics.includes(name);
      if (isAlreadySelected) {
        return prevSelectedTopics.filter((t) => t !== name);
      }
      return [...prevSelectedTopics, name];
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
      <Spin spinning={isTopicsUpdating} size={"large"}>
        <WelcomeContainer>
          {[1, 2, 3].map((group) => (
            <Box key={group}>{renderTopicsContainer(group)}</Box>
          ))}
        </WelcomeContainer>
      </Spin>
    </Box>
  );
};
