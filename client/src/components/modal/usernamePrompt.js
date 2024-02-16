import React, { useState, useEffect } from 'react';

function UsernamePrompt({ providerName, displayName, providerShorthand, authType }) {
  const [buttonLabel, setButtonLabel] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem(`${providerName}Username`);
    if (storedUsername) {
      setButtonLabel(providerShorthand + "/" + storedUsername);
    } else {
      setButtonLabel(displayName);
    }
  }, [providerName, displayName, providerShorthand]);

  const handlePrompt = () => {
    const userInput = window.prompt(`${displayName} name?`);
    if (userInput !== null && userInput.trim() !== "") {
      localStorage.setItem(`${providerName}Username`, userInput);
      setButtonLabel(providerShorthand + "/" + userInput);
    } 
  };

  return (
    <div>
      <button 
        onClick={handlePrompt} 
        style={{
          background: 'none',
          color: 'white',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}>
        {buttonLabel}
      </button>
    </div>
  );
}

export default UsernamePrompt;
