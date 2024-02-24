import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const OpenIdCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (code) {
      console.log('code: ', code)
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
        console.log(data);
        navigate('/');
      })
      .catch(error => {
        console.error('Error:', error);
        navigate('/', { state: { error: 'Failed to authenticate.' } });
      });
    } else {
      navigate('/');
    }
    
  }, [location, navigate]);

  return (
    <div>
      Processing authentication...
    </div>
  );
};
