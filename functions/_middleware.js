import CFPagesAuth from '@kjartanm/cf-pages-authjs';
import { TeamworkProvider } from './teamworkProvider';

const { authPlugin, setSession, createLoginMiddleware } = CFPagesAuth((env) => {
  return {
    providers: [
      TeamworkProvider({
        clientId: env.TEAMWORK_ID,
        clientSecret: env.TEAMWORK_SECRET,
      }),
    ],
  };
});

export const onRequest = [authPlugin, setSession, createLoginMiddleware];
