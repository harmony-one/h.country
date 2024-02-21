const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());
require('dotenv').config();

app.post('/api/openid/exchange-code', async (req, res) => {
  const { code } = req.body;

  try {
    // Exchange the authorization code for tokens with Auth0
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.AUTH0_CALLBACK_URL,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const { access_token, id_token } = tokenResponse.data;

    // Optionally, fetch user profile information from Auth0's /userinfo endpoint
    const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Respond with tokens and user information
    res.json({
      success: true,
      accessToken: access_token,
      idToken: id_token,
      userDetails: userInfoResponse.data,
    });
  } catch (error) {
    console.error('Failed to exchange code for tokens or fetch user details:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorDetails: error.response ? error.response.data : error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
