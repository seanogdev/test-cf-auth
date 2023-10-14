import CFPagesAuth from '@kjartanm/cf-pages-authjs';
import { TeamworkProvider } from './teamworkProvider';
import Github from '@auth/core/providers/github';

export const REDIRECT_LOGIN_RESPONSE = new Response(null, {
  status: 302,
  headers: {
    Location: '/auth',
  },
});

function getAuthConfig(env) {
  /**
   * @type {import('@auth/core').AuthConfig} auth
   */
  return {
    providers: [
      Github({
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET,
      }),
      TeamworkProvider({
        clientId: env.TEAMWORK_ID,
        clientSecret: env.TEAMWORK_SECRET,
      }),
    ],
    secret: env.AUTH_SECRET,
    trustHost: true,
    session: {
      strategy: 'jwt',
      maxAge: 2 * 3600, //two hours
    },
    callbacks: {
      async jwt({ token, profile, account }) {
        if (account) {
          token.provider = account.provider;
        }
        return token;
      },

      async session({ session, token }) {
        session.provider = token.provider;
        return session;
      },
    },
  };
}

const pagesAuth = CFPagesAuth(getAuthConfig);

/**
 * @param {import('@cloudflare/workers-types').EventContext} [context]
 */
async function handleRequest(context) {
  return REDIRECT_LOGIN_RESPONSE;
}

export const onRequest = [
  pagesAuth.authPlugin,
  pagesAuth.setSession,
  handleRequest,
];
