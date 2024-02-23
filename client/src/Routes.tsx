import { Route, Routes } from "react-router-dom";
import { WelcomePage } from "./pages/welcome";
import { AuthPage } from "./pages/auth/AuthPage";
import { AppLayout } from "./components/layout";
import { MainPage } from "./pages/main";
import { UserPageByKey, UserPageBySocial } from "./pages/user";
import { TagPageByName } from "./pages/tag";
import {PageNotFound} from "./pages/404";
import { OpenIdCallback } from "./oAuth/openIdCallback";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={'/hash'} element={<WelcomePage />} />
      <Route path={'/new'} element={<WelcomePage />} />
      <Route element={<AppLayout />}>
        <Route path={'/'} element={<MainPage />} />
        <Route path="/h/:tagName" element={<TagPageByName />} />
        <Route path="/0/:key" element={<UserPageByKey />} />
        <Route path="/:socialType/:username" element={<UserPageBySocial />} />
        <Route path={'/auth'} element={<AuthPage />} />
        <Route path="/auth/openid-callback" element={<OpenIdCallback />} />
        <Route path="/home" element={<MainPage />} />
      </Route>
      <Route path={'*'} element={<PageNotFound />} />
    </Routes>
  );
}
