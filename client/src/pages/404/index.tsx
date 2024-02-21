import { Box, Text } from 'grommet'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'

export const PageNotFound = () => {
  const navigate = useNavigate()

  return <Box margin={{ top: '32px' }} align={'center'}>
    <Box gap={'16px'} align={'center'}>
      <Text>Page not found</Text>
      <Button type={'primary'} onClick={() => navigate('/')}>
        Open main page
      </Button>
    </Box>
  </Box>
}
