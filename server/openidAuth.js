// Change the import syntax to require
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Your cors and express.json middleware setup remains the same
app.use(cors({
  origin: 'https://g.country', // Allow only your React app's domain
  methods: ['GET', 'POST'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // If your client needs to send cookies or authorization headers
}));
app.use(express.json());

// Initialize dotenv
dotenv.config();

// The rest of your server logic remains largely unchanged
app.post('/api/openid/exchange-code', async (req, res) => {
  const { code } = req.body;
  console.log("code token: ", code);

  try {
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

    const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

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
