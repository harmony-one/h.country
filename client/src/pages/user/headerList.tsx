import React, { ReactNode, useState } from 'react';
import { Box, Text, Layer, FormField, TextInput, Form } from 'grommet';
import { handleSubmit } from '.';
import { ethers } from 'ethers';
import { Button } from 'antd';
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

  const [isSubmitting, setSubmitting] = useState(false)
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
    return pattern.test(url);
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

  const submitData = async (e: any) => {
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
    if (wallet !== undefined && key !== undefined) {
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

  const onSubmitClicked = async (e: any) => {
    e.preventDefault();
    try {
      setSubmitting(true)
      await submitData(e);
    } catch (e) {
      console.error('Failed to submit:', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Box direction={"row"} gap={"24px"} align={"center"}>
        <Box width={"116px"} align={"center"} onClick={onTitleClick}>
          <Text size={"164px"} weight={800} color={"blue1"}>
            {title}
          </Text>
        </Box>
        <Box gap={"8px"}>{items.map((item) => item.content)}</Box>
      </Box>

      {showPopup && (
        <Layer
          position="center"
          onClickOutside={handleClosePopup}
          onEsc={handleClosePopup}
        >
          <Box pad="medium" gap="small" width="medium">
            <Form onSubmit={onSubmitClicked}>
              <FormField label={popupType === 'hashtag' ? "Enter Hashtag" : "Enter URL"} name={popupType} required>
                <TextInput
                  disabled={isSubmitting}
                  name={popupType}
                  value={popupType === 'hashtag' ? inputText : inputUrl}
                  onChange={(event) => popupType === 'hashtag' ? setInputText(event.target.value) : setInputUrl(event.target.value)}
                  color='#2aaee9'
                  style={{ borderColor: '#2aaee9' }}
                />
              </FormField>
              <Box direction="row" justify="end" gap={'16px'} margin={{ top: 'medium' }}>
                <Button onClick={handleClosePopup} color="#2aaee9">Cancel</Button>
                <Button
                  type="primary"
                  htmlType={'submit'}
                  style={{ backgroundColor: '#2aaee9' }}
                  loading={isSubmitting}
                >
                  Submit
                </Button>
              </Box>
            </Form>
          </Box>
        </Layer>
      )}
    </Box>
  );
};
