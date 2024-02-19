import React from 'react'
import { Helmet } from 'react-helmet'

interface Props {}

export const MetaTags: React.FC<Props> = () => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>Human Protocol</title>
      <meta
        name="description"
        content="Tag anyone you meet in person to boost their #hash^powers of secret talent or future plans. Or, add their /slash~links of current location or social profiles."
      />
    </Helmet>
  )
}
