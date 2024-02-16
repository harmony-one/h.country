import React, { ReactNode, useState } from 'react';
import { Box, Button, Text, Layer, FormField, TextInput, Form } from 'grommet';
import { handleSubmit } from '.';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../../configs/firebase-config';

interface HeaderListProps {
  title: string;
  items: Array<{ content: ReactNode }>;
  wallet: ethers.Wallet | undefined;
  onUrlSubmit?: (url: string) => void;
}

export const HeaderList = (props: HeaderListProps) => {
  const { title, items, wallet } = props;
  const { key } = useParams();

  const [showPopup, setShowPopup] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [popupType, setPopupType] = useState<'hashtag' | 'url'>('hashtag');

  const hashtagHeader = () => {
    setShowPopup(true);
  };

  const slashHeader = () => {
    setPopupType('url');
    setShowPopup(true);
  };

  const onTitleClick = () => {
    if (title === '#') {
      hashtagHeader();
    } else if (title === '/') {
      slashHeader();
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const isValidUrl = (url: string) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
  }

  const onUrlSubmit = async (url: string) => {
    if (!key) {
      console.error("No key provided for URL submission.");
      return;
    }
  
    let fieldName: 'x' | 'ig' | '' = '';
    if (url.includes("twitter.com")) {
      fieldName = 'x'; // For Twitter links
    } else if (url.includes("instagram.com")) {
      fieldName = 'ig'; // For Instagram links
    } else {
      console.error("URL is neither Twitter nor Instagram.");
      return;
    }
  
    const updateData: { [key: string]: string } = {};
    if (fieldName) {
      updateData[fieldName] = url;
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
            <Text size={"164px"} color={"blue1"}>
              {title}
            </Text>
          </Box>
        </Button>
        <Box gap={"8px"}>{items.map((item) => item.content)}</Box>
      </Box>

      {showPopup && (
        <Layer
          position="center"
          onClickOutside={handleClosePopup}
          onEsc={handleClosePopup}
        >
          <Box pad="medium" gap="small" width="medium">
            <Form onSubmit={
              async (e) => {
                e.preventDefault();
                if (popupType === 'hashtag') {
                  if (!inputText.trim() || inputText.includes(' ')) {
                    alert('Enter a single hashtag without any spaces.');
                    return;
                  }
                } else if (popupType === 'url') {
                  if (!isValidUrl(inputUrl)) {
                    alert('Enter a valid URL.');
                    return;
                  } else {
                    await onUrlSubmit(inputUrl);
                  }
                }
                if (wallet !== undefined) {
                  const addressWithoutPrefix = wallet.address.slice(2);
                  const submitText = popupType === 'hashtag' ? `#${inputText}` : inputUrl;
                  await handleSubmit(e, addressWithoutPrefix, `${submitText} @${key}`);
                  setInputText('');
                  setInputUrl('');
                  setShowPopup(false);
                } else {
                  console.log("Invalid user wallet");
                }
              }
            }>
              <FormField label={popupType === 'hashtag' ? "Enter Hashtag" : "Enter URL"} name={popupType} required>
                <TextInput
                  name={popupType}
                  value={popupType === 'hashtag' ? inputText : inputUrl}
                  onChange={(event) => popupType === 'hashtag' ? setInputText(event.target.value) : setInputUrl(event.target.value)}
                  color='#2aaee9'
                  style={{ borderColor: '#2aaee9' }}
                />
              </FormField>
              <Box direction="row" justify="between" margin={{ top: 'medium' }}>
                <Button label="Cancel" onClick={handleClosePopup} color="#2aaee9" />
                <Button type="submit" label="Submit" primary style={{ backgroundColor: '#2aaee9' }} />
              </Box>
            </Form>
          </Box>
        </Layer>
      )}
    </Box>
  );
};
