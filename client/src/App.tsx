import React from 'react';
import { Grommet } from "grommet";
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./Routes";
import { ToastContainer } from "react-toastify";
import { UserProvider, ActionsProvider } from "./context";
import { theme } from "./theme/grommet";
import useDarkMode from './hooks/useDarkMode';
import { MetaTags } from './components/metatags';
import { updateMomentJSConfig } from "./configs/moment-js";

updateMomentJSConfig()

function App() {
  return (
    <Grommet full theme={theme} themeMode={useDarkMode() ? 'dark' : 'light'}>
      <BrowserRouter>
        <UserProvider>
          <ActionsProvider>
            <MetaTags />
            <AppRoutes />
          </ActionsProvider>
        </UserProvider>
      </BrowserRouter>
      <ToastContainer />
    </Grommet>
  );
}

export default App;
