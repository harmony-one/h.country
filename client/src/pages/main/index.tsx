import React, {ReactNode, useState, useEffect} from 'react'
import {Box, Text} from "grommet";
import {PlainButton} from "../../components/button";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../../configs/firebase-config";

const testUsername = "WanderingGiraffe54";

interface HeaderListProps {
  title: string
  items: Array<{ content: ReactNode }>
}

interface Message {
  id: string;
  hashtags?: string[];
}

const HeaderList = (props: HeaderListProps) => {
  const { title, items } = props

  return <Box
    direction={'row'}
    gap={'24px'}
    align={'center'}
  >
    <Box width={'116px'} align={'center'}>
      <Text size={'164px'} color={'blue1'}>{title}</Text>
    </Box>
    <Box gap={'8px'}>
      {items.map(item => item.content)}
    </Box>
  </Box>
}

const UserAction = (props: { action: string }) => {
  return <Box border={{ side: 'bottom' }} pad={'4px 0'}>
    <Text size={'small'}>{props.action}</Text>
  </Box>
}

export const MainPage = () => {
  const linkItems = [{
    content: <Text>x/stse</Text>
  }, {
    content: <Text>t/stephenstse</Text>
  }, {
    content: <Text>g/stephen-tse</Text>
  }]

  const actions: string[] = [
    'x/stse links Github g/stephen-tse',
    'x/stse links Telegram g/stephentse',
    'g/soph-neou 🤖by x/stse'
  ]

  const [tagItems, setTagItems] = useState<Array<{ content: ReactNode }>>([]);
  useEffect(() => {
    const messagesQuery = query(collection(db, "messages"), where("username", "==", testUsername));
  
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: Message[] = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Message[]; // Cast to Message[] to satisfy TypeScript
  
      const allHashtags = messages.flatMap(msg => msg.hashtags || []);
      const hashtagFrequency = allHashtags.reduce<Record<string, number>>((acc, hashtag) => {
        acc[hashtag] = (acc[hashtag] || 0) + 1;
        return acc;
      }, {});
  
      const sortedHashtags = Object.entries(hashtagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hashtag, count]) => ({
          content: (
            <Box direction={'row'} key={hashtag}> {/* Ensure key is provided for list items */}
              <Text>{hashtag}</Text>
              <Text size={'xsmall'}>{count}</Text>
            </Box>
          )
        }));
  
      setTagItems(sortedHashtags);
    });
  
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);  

  return <Box>
    <Box>
      <HeaderList title={'/'} items={linkItems} />
      <HeaderList title={'#'} items={tagItems} />
    </Box>
    <Box>
      <Box direction={'row'} gap={'16px'}>
        <PlainButton>All(91)</PlainButton>
        <PlainButton>@stse(12)</PlainButton>
      </Box>
    </Box>
    <Box margin={{ top: '16px' }} gap={'4px'}>
      {actions.map(action => {
        return <UserAction key={action} action={action} />
      })}
    </Box>
  </Box>
}

