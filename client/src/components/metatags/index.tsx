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
        content="Human Protocol is Harmony's text text text text!"
      />
    </Helmet>
  )
}
