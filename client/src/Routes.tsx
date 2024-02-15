import { Route, Routes } from "react-router-dom";
import { WelcomePage } from "./pages/welcome";
import { AppLayout } from "./components/layout";
import { MainPage } from "./pages/main";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={'welcome'} element={<WelcomePage />} />
      <Route element={<AppLayout />}>
        <Route path={'/'} element={<MainPage />} />
      </Route>
    </Routes>
  );
}
