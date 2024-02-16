import React from 'react';
import {Grommet} from "grommet";
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter} from "react-router-dom";
import {AppRoutes} from "./Routes";
import {ToastContainer} from "react-toastify";
import {UserProvider} from "./context/UserContext";
import {theme} from "./theme/grommet";
import useDarkMode from './hooks/useDarkMode';
import { MetaTags } from './components/metatags';

function App() {
  return (
    <Grommet full theme={theme} themeMode={useDarkMode()  ? 'dark' : 'light'}>
      <BrowserRouter>
        <UserProvider>
          <MetaTags />
          <AppRoutes />
        </UserProvider>
      </BrowserRouter>
      <ToastContainer />
    </Grommet>
  );
}

export default App;
