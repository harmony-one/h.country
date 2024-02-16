import { Box } from "grommet";
import UsernamePrompt from "../../components/modal/usernamePrompt";

export const AuthPage = () => {

  return (
    <Box align="center" pad={{ top: '15vh' }} gap={'16px'}>
      <UsernamePrompt providerName="google-oauth2" displayName="Google" providerShorthand="g" authType="openid" />
      <UsernamePrompt providerName="twitter" displayName="Twitter" providerShorthand="x" authType="openid" />
      <UsernamePrompt providerName="github" displayName="Github" providerShorthand="git" authType="openid" />
      <UsernamePrompt providerName="linkedin" displayName="LinkedIn" providerShorthand="l" authType="openid" />
      <UsernamePrompt providerName="discord" displayName="Discord" providerShorthand="d" authType="openid" />
    </Box>
  );
}
