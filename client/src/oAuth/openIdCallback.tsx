import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const OpenIdCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (code) {
      // Update the endpoint to a more general name reflecting its purpose
      fetch('https://arcane-scrubland-65117-d47280ee383b.herokuapp.com/api/openid/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Assuming `data` contains relevant user info or a success message
        console.log(data);
        // Navigate to a path indicating successful login or to the user's dashboard
        navigate('/'); // Adjust according to your app's routing
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle errors, possibly navigate to an error page or login page
        navigate('/', { state: { error: 'Failed to authenticate.' } });
      });
    } else {
      // No code in URL, navigate back to login or home
      navigate('/');
    }
    
  }, [location, navigate]);

  return (
    <div>
      Processing authentication...
    </div>
  );
};
