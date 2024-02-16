import React, { ReactNode, useState } from 'react';
import { Box, Button, Text, Layer, FormField, TextInput, Form } from 'grommet';
import { handleSubmit } from '.';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';

interface HeaderListProps {
  title: string;
  items: Array<{ content: ReactNode }>;
  wallet: ethers.Wallet | undefined;
}

export const HeaderList = (props: HeaderListProps) => {
  const { title, items, wallet } = props;
  const { key } = useParams();

  const [showPopup, setShowPopup] = useState(false);
  const [inputText, setInputText] = useState('');

  const hashtagHeader = () => {
    setShowPopup(true);
  };
  
  const slashHeader = () => {
    // TODO: slash header logic
  }

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
                if (!inputText.trim() || inputText.includes(' ')) {
                  alert('Enter a single hashtag without any spaces.');
                  return;
                }
                if (wallet !== undefined) {
                  const addressWithoutPrefix = wallet.address.slice(2);
                  await handleSubmit(e, addressWithoutPrefix, `#${inputText} @${key}`);
                  setInputText('');
                  setShowPopup(false);
                } else {
                  console.log("Invalid user wallet");
                }
              }
            }>
              <FormField label="Enter Hashtag" name="hashtag" required>
                <TextInput
                  name="hashtag"
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  color='#2aaee9'
                  style={{ borderColor: '#2aaee9' }}
                />
              </FormField>
              <Box direction="row" justify="between" margin={{ top: 'medium' }}>
                <Button label="Cancel" onClick={handleClosePopup} color="#2aaee9" />
                <Button type="submit" label="Submit" primary style={{ backgroundColor: '#2aaee9' }}/>
              </Box>
            </Form>
          </Box>
        </Layer>
      )}
    </Box>
  );
};
