import CFPagesAuth from '@kjartanm/cf-pages-authjs';
import { TeamworkProvider } from './teamworkProvider';

const { authPlugin } = CFPagesAuth({
  providers: [
    TeamworkProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
});

export const onRequest = [authPlugin];
