import { Route, Routes } from "react-router-dom";
import { WelcomePage } from "./pages/welcome";
import { AppLayout } from "./components/layout";
import { MainPage } from "./pages/main";
import { UserPageByKey, UserPageBySocial } from "./pages/user";
import { TagPageByName } from "./pages/tag";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={'/welcome'} element={<WelcomePage />} />
      <Route element={<AppLayout />}>
        <Route path={'/'} element={<MainPage />} />
        <Route path="/h/:tagName" element={<TagPageByName />} />
        <Route path="/0/:key" element={<UserPageByKey />} />
        <Route path="/:socialType/:username" element={<UserPageBySocial />} />
      </Route>
    </Routes>
  );
}
