import { Route, Routes } from "react-router-dom";
import { WelcomePage } from "./pages/welcome";
import { AppLayout } from "./components/layout";
import { MainPage } from "./pages/main";
import { UserPage } from "./pages/user";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={'welcome'} element={<WelcomePage />} />
      <Route element={<AppLayout />}>
        <Route path={'/'} element={<MainPage />} />
        <Route path="/0/:key" element={<UserPage />} />
      </Route>
    </Routes>
  );
}
