import React, {ReactNode} from 'react'
import {Box, Text} from "grommet";
import {PlainButton} from "../../components/button";

interface HeaderListProps {
  title: string
  items: Array<{ content: ReactNode }>
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

  const tagItems = [{
    content: <Box direction={'row'}>
      <Text>one</Text>
      <Text size={'xsmall'}>99</Text>
    </Box>
  }, {
    content: <Box direction={'row'}>
      <Text>compiler</Text>
      <Text size={'xsmall'}>42</Text>
    </Box>
  }, {
    content: <Box direction={'row'}>
      <Text>map</Text>
      <Text size={'xsmall'}>11</Text>
    </Box>
  }, {
    content: <Box direction={'row'}>
      <Text>ai</Text>
      <Text size={'xsmall'}>2</Text>
    </Box>
  }]

  const actions: string[] = [
    'x/stse links Github g/stephen-tse',
    'x/stse links Telegram g/stephentse',
    'g/soph-neou 🤖by x/stse'
  ]

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
