import { Auth } from '@auth/core';
import { TeamworkProvider } from './teamworkProvider';

/** @return {import('@auth/core').AuthConfig} */
async function getAuthConfig(context) {
  return {
    providers: [
      TeamworkProvider({
        clientId: context.env.TEAMWORK_ID,
        clientSecret: context.env.TEAMWORK_SECRET,
      }),
    ],
    secret: context.env.AUTH_SECRET,
    trustHost: true,
    session: {
      strategy: 'jwt',
      maxAge: 14 * 24 * 3600, //two weeks
    },
    theme: {
      brandColor: '#3C55BD',
      logo: 'https://www.teamwork.com/images/logo.png',
    },
    callbacks: {
      async jwt({ token, account }) {
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

async function getSession(context) {
  const { request } = context;
  const authOptions = await getAuthConfig(context);
  const url = new URL('/auth/session', request.url);
  const sessionRequest = new Request(url, { headers: request.headers });
  const response = await Auth(sessionRequest, authOptions);
  const { status = 200 } = response;
  const session = await response.json();
  if (!session || !Object.keys(session).length) {
    return null;
  }
  if (status === 200 || status === 302) {
    return session;
  }
  throw new Error(session.message);
}
async function setSession(context) {
  const session = await getSession(context);
  if (session) {
    context.data.session = session;
  }
  return context.next();
}

async function handleAuth(context) {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith('/auth/')) {
    return context.next();
  }
  const authOptions = await getAuthConfig(context);
  const resp = await Auth(context.request, authOptions);
  return resp;
}

async function handleRequest(context) {
  if (context.data.session) {
    return context.next();
  }
  const url = new URL(context.request.url);
  const response = Response.redirect(url.origin + '/auth/signin', 302);
  return response;
}

export const onRequest = [handleAuth, setSession, handleRequest];
