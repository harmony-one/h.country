interface LoginParams {
    providerName: string;
  }
  
const handleOpenIdLogin = ({ providerName }: LoginParams) => {
    const auth0Domain = 'http://dev-j4t5eeehosnfkpcf.us.auth0.com';
    const clientId = 'y8JwYhx0JkiKCbfikRTFGTNaTy7CUpnA';
    const responseType = 'code';
    const redirectUri = encodeURIComponent('http://g.country/auth/openid-callback');
    const scope = encodeURIComponent('openid profile email');
  
    const loginUrl = `${auth0Domain}/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&connection=${providerName}`;
  
    window.location.href = loginUrl;
  };
  
  export { handleOpenIdLogin };
  