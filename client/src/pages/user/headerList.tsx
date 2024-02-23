import React from "react";
import { Box, Button, Text } from "grommet";
import { ethers } from "ethers";
import { doc, setDoc } from "firebase/firestore";
import styled from "styled-components";
import { handleOpenIdLogin } from "../../oAuth/openIdLogin";

import { db } from "../../configs/firebase-config";
import { addMessageWithGeolocation } from "../../api";
import { socialUrlParser } from "../../utils";
import { ReactComponent as NumberImg } from '../../assets/images/number.svg'
import { ReactComponent as SlashImg } from '../../assets/images/slash.svg'

export const HeaderText = styled(Text)`
  font-size: min(1em, 4vw);
  color: ${props => props.theme.global.colors.grey1};

  a {
    color: ${props => props.theme.global.colors.grey1};
  }
`;

export const SmallHeaderText = styled(Text)`
  font-size: min(0.8em, 2.5vw);
  line-height: 2.3em;
  color: ${props => props.theme.global.colors.grey1};
  
  @media only screen and (min-width: 380px) {
    line-height: 2em;
  }

  @media only screen and (min-width: 450px) {
    line-height: 1em;
  }
`;

const HeaderListIcon = styled(Box) <{ isUserPage?: Boolean }>`
  
  ${(props) => !props.isUserPage ?
    `filter: brightness(0) 
      saturate(100%) 
      invert(94%) 
      sepia(54%) 
      saturate(626%) 
      hue-rotate(317deg) 
      brightness(106%) 
      contrast(104%);` : ''};

  svg {
    height: 70px
  }
   
  @media only screen and (min-width: 450px) {
    svg {
      height: 100px
    }
  }
`
interface HeaderListProps {
  userId: string;
  isLoading?: boolean;
  isUserPage: boolean;
  type: "url" | "hashtag";
  items: Array<{
    id: string;
    index: number;
    text: JSX.Element | string;
    predefined?: boolean;
    providerName?: string;
  }>;
  wallet: ethers.Wallet | undefined;
  onUrlSubmit?: (url: string) => void;
}

interface TitleClickEvent {
  providerName: string;
}


export const HeaderList = (props: HeaderListProps) => {
  const { userId: key, type, items, wallet, isUserPage } = props;
  const addressWithoutPrefix = wallet ? wallet.address.slice(2) : '';

  const onHashSubmit = async (hashtag: string) => {
    if (!wallet || !key) {
      console.log("Invalid user wallet or key");
      return;
    }
    const submitText = `#${hashtag} @${key}`;

    await addMessageWithGeolocation(addressWithoutPrefix, submitText);
  };

  const onTitleClick = async ({ providerName }: TitleClickEvent) => {
    console.log("clicked", providerName)
    const input = window.prompt(
      type === "hashtag" ? "hash?" : `${providerName}?`
    );

    if (input === null) {
      console.log("Prompt was cancelled.");
      handleOpenIdLogin({providerName})
      return;
    }

    if (type === "hashtag" && !input.trim().includes(" ")) {
      await onHashSubmit(input.trim());
    } else if (type === "url") {
      await onUrlSubmit(input, providerName);
    } else {
      alert("Enter a valid input.");
    }
  };

  const onUrlSubmit = async (url: string, providerName: string) => {
    if (!key) {
      console.error("No key provided for URL submission.");
      return;
    }

    const socialObj = socialUrlParser(url, providerName);

    if (!socialObj) {
      alert("Enter a valid username.");
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
    <Box
      direction={"row"}
      align={"center"}
    >
      {type === "hashtag"
        ? <Box style={{ flex: '5' }}>
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
        </Box>
        : <Box style={{ flex: '5' }}>
          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(3, 1fr)",
              gridAutoColumns: "1fr",
            }}
          >
            {items.map((item) => (
              <div
                key={item.index}
                style={{
                  gridRowStart: (item.index % 3) + 1,
                  gridColumnStart: Math.floor(item.index / 3) + 1,
                  width: "100%",
                  textAlign: "left"
                }}
              >
                <Box key={item.id}>
                  {(item.predefined === true && item.providerName !== undefined) ?
                    <Button plain>
                      <HeaderText onClick={() => { onTitleClick({ providerName: item.providerName! }) }}>{item.text}</HeaderText>
                    </Button> :
                    <HeaderText>{item.text}</HeaderText>}
                </Box>
              </div>
            ))}
          </div>
        </Box>
      }
      <Button plain onClick={() => onTitleClick({ providerName: "any" })}>
        <HeaderListIcon width={'60px'} align={"start"} pad={'8px'} isUserPage={isUserPage}>
          {type === "hashtag"
            ? <NumberImg />
            : <SlashImg />
          }
        </HeaderListIcon>
      </Button>
    </Box>
  );
};
