import CFPagesAuth from '@kjartanm/cf-pages-authjs';
import { TeamworkProvider } from './teamworkProvider';
// import { Github } from '@auth/core/providers/github';

function getAuthConfig(env) {
  /**
   * @type {import('@auth/core').AuthConfig} auth
   */
  return {
    providers: [
      // Github({
      //   clientId: env.GITHUB_ID,
      //   clientSecret: env.GITHUB_SECRET,
      // }),
      TeamworkProvider({
        clientId: env.TEAMWORK_ID,
        clientSecret: env.TEAMWORK_SECRET,
      }),
    ],
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

const { authPlugin, setSession, createLoginMiddleware } =
  CFPagesAuth(getAuthConfig);

const addLoginComponent = createLoginMiddleware(
  ({ env }) => {
    return `<div class="cf-pages-authjs-login-link"><a href="/auth/signin?callbackUrl=${env.CALLBACK_URL}">Logg inn</a></div>`;
  },
  ({ data }) => {
    return `
        <div>${data.session.user.email}</div>
        <div class="cf-pages-authjs-login-link"><a href="/auth/signout?callbackUrl=/test2">Logg ut</a></div>`;
  },
);

export const onRequest = [authPlugin, setSession, addLoginComponent];
