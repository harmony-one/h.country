import React, { ReactNode } from 'react';
import { Box, Button, Text } from 'grommet';
import { handleSubmit } from '.';
import { ethers } from 'ethers';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../../configs/firebase-config';
import { socialUrlParser } from '../../utils';

interface HeaderListProps {
  userId: string;
  isLoading?: boolean
  type: 'url' | 'hashtag'
  items: Array<{ content: ReactNode }>;
  wallet: ethers.Wallet | undefined;
  onUrlSubmit?: (url: string) => void;
}

export const HeaderList = (props: HeaderListProps) => {
  const { userId: key, isLoading, type, items, wallet } = props;

  const onHashSubmit = async (hashtag: string) => {
    if (!wallet || !key) {
      console.log("Invalid user wallet or key");
      return;
    }
    const addressWithoutPrefix = wallet.address.slice(2);
    const submitText = `#${hashtag} @${key}`;

    await handleSubmit(undefined, addressWithoutPrefix, submitText);
  };

  const onTitleClick = async () => {
    const input = window.prompt(type === 'hashtag' ? 'Enter Hashtag (without #):' : 'Enter URL:');

    if (input === null) {
      console.log('Prompt was cancelled.');
      return;
    }

    if (type === 'hashtag' && !input.trim().includes(' ')) {
      await onHashSubmit(input.trim());
    } else if (type === 'url') {
      await onUrlSubmit(input);
    } else {
      alert('Enter a valid input.');
    }
  };

  const onUrlSubmit = async (url: string) => {
    if (!key) {
      console.error("No key provided for URL submission.");
      return;
    }

    const socialObj = socialUrlParser(url)[0];

    console.log(1111, socialObj);

    //return;

    if (!socialObj) {
      alert('Enter a valid URL.');
      return;
    }

    const updateData = {
      [socialObj.type]: {
        username: socialObj.username,
        url: socialObj.url,
      }
    }

    try {
      await setDoc(doc(db, "userLinks", key), updateData, { merge: true });
      console.log("Document successfully updated or created with URL.");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  return (
    <Box>
      <Box direction={"row"} gap={"24px"} align={"center"}>
        <Button plain onClick={onTitleClick}>
          <Box width={"116px"} align={"center"}>
            <Text size={"164px"} weight={800} color={"blue1"}>
              {type === 'hashtag' ? '#' : '/'}
            </Text>
          </Box>
        </Button>
        {!isLoading && items.length > 0 && <Box gap={"8px"}>
            {items.map((item) => item.content)}
          </Box>
        }
      </Box>
    </Box>
  );
};
