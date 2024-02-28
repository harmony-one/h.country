/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box } from "grommet";
import styled from "styled-components";
import { Typography } from "antd"; // Spin
import useDarkMode from "../../hooks/useDarkMode";
import { UserTopic } from "../../types";

export const WelcomeContainer = styled(Box)`
  margin: 0 auto !important;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 2em;
  width: 100%;
  height: 100svh;
`;

export const TopicsContainer = styled(Box)`
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

export const TopicItemContainer = styled(Box)<{ isSelected?: boolean }>`
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

export const TopicItemImage = styled.img<{ isDark?: Boolean }>`
  max-width: 50%;
  max-height: 50%;

  ${(props) =>
    props.isDark
      ? `filter: invert(100%)
        sepia(92%) 
        saturate(1%) 
        hue-rotate(290deg) 
        brightness(105%) 
        contrast(101%);`
      : ""};
`;

export const TopicItemAlias = styled(Box)`
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

export const TopicItem = (props: TopicItemProps) => {
  const { topic, isSelected, onClick } = props;
  const [image, setImage] = useState(topic.light);
  const [showLabel, setShowLabel] = useState(true); // false

  const themeMode = useDarkMode();

  useEffect(() => {
    if (isSelected) {
      setImage(topic.color);
    } else {
      const logo = topic.light;
      setImage(logo);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, themeMode]);

  const prefix = ""; // "#"; // topic.type === 'blockchain' ? '$' : '#'

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
            style={{
              fontSize: "min(5vw, 1.5rem)",
              fontWeight: 600,
              color: isSelected ? "#64ebfd" : "#B3B3B3",
            }}
          >
            {prefix}
            {topic.name}
          </Typography.Text>
        )}
      </TopicItemAlias>
    </TopicItemContainer>
  );
};