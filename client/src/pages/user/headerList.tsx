import React from "react";
import { Box, Button, Text } from "grommet";
import { addMessageWithGeolocation } from "../../api";
import { ethers } from "ethers";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../configs/firebase-config";
import { socialUrlParser } from "../../utils";

import styled from "styled-components";


const HeaderText = styled(Text)`
  font-size: min(1em, 3vw);
` 

interface HeaderListProps {
  userId: string;
  isLoading?: boolean;
  isUserPage: boolean;
  type: "url" | "hashtag";
  items: Array<{
    id: string;
    text: JSX.Element | string;
    predefined?: boolean;
    provider?: string;
  }>;
  wallet: ethers.Wallet | undefined;
  onUrlSubmit?: (url: string) => void;
}

interface TitleClickEvent {
  provider: string;
}

export const HeaderList = (props: HeaderListProps) => {
  const { userId: key, isUserPage, type, items, wallet } = props;
  const onHashSubmit = async (hashtag: string) => {
    if (!wallet || !key) {
      console.log("Invalid user wallet or key");
      return;
    }
    const addressWithoutPrefix = wallet.address.slice(2);
    const submitText = `#${hashtag} @${key}`;

    await addMessageWithGeolocation(addressWithoutPrefix, submitText);
  };

  const onTitleClick = async ({ provider }: TitleClickEvent) => {
    console.log("clicked", provider)
    const input = window.prompt(
      type === "hashtag" ? "Enter Hashtag (without #):" : "Enter URL:"
    );

    if (input === null) {
      console.log("Prompt was cancelled.");
      return;
    }

    if (type === "hashtag" && !input.trim().includes(" ")) {
      await onHashSubmit(input.trim());
    } else if (type === "url") {
      await onUrlSubmit(input);
    } else {
      alert("Enter a valid input.");
    }
  };

  const onUrlSubmit = async (url: string) => {
    if (!key) {
      console.error("No key provided for URL submission.");
      return;
    }

    const socialObj = socialUrlParser(url)[0];

    if (!socialObj) {
      alert("Enter a valid URL.");
      return;
    }

    const updateData = {
      [socialObj.type]: {
        username: socialObj.username,
        url: socialObj.url,
      },
    };

    try {
      await setDoc(doc(db, "userLinks", key), updateData, { merge: true });

      if (!wallet || !key) {
        console.log("Invalid user wallet or key");
        return;
      }

      const addressWithoutPrefix = wallet.address.slice(2);

      await addMessageWithGeolocation(
        addressWithoutPrefix,
        `@${socialObj.username} ${socialObj.url}`
      );

      console.log("Document successfully updated or created with URL.");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  return (
    <Box>
      <Box direction={"row"} gap={"24px"} align={"center"}>
        <Button plain onClick={() => onTitleClick({provider: "all"})}>
          <Box width={"116px"} align={"center"}>
            <Text
              size={"164px"}
              weight={800}
              color={isUserPage ? "blue1" : "yellow1"}
            >
              {type === "hashtag" ? "#" : "/"}
            </Text>
          </Box>
        </Button>
        { type === "hashtag" ? <Box style={{ flex: '5'}}>
            <div
              style={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                gridAutoColumns: "1fr",
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    gridRowStart: (index % 3) + 1,
                    gridColumnStart: Math.floor(index / 3) + 1,
                    width: "100%",
                    textAlign: "left"
                  }}
                >
                  <Box key={item.id}>
                    <HeaderText>{item.text}</HeaderText>
                  </Box>
                </div>
              ))}
            </div>
          </Box> :
          <Box style={{ flex: '5'}}>
            <div
              style={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                gridAutoColumns: "1fr",
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    gridRowStart: (index % 3) + 1,
                    gridColumnStart: Math.floor(index / 3) + 1,
                    width: "100%",
                    textAlign: "left"
                  }}
                >
                  <Box key={item.id}>
                  {(item.predefined === true && item.provider !== undefined) ? 
                    <Button plain>
                      <HeaderText onClick={() => {onTitleClick({provider: item.provider!})}}>{item.text}</HeaderText>
                    </Button> : 
                    <HeaderText>{item.text}</HeaderText>}
                  </Box>
                </div>
              ))}
            </div>
          </Box>
        }
      </Box>
    </Box>
  );
};
