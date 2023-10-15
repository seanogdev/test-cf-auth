import { Auth } from '@auth/core';
import { TeamworkProvider } from './teamworkProvider';

async function getAuthConfig(context) {
  /** @type {import('@auth/core').AuthConfig} */
  return {
    providers: [
      TeamworkProvider({
        clientId: context.env.TEAMWORK_ID,
        clientSecret: context.env.TEAMWORK_SECRET,
      }),
    ],
    prefix: '/auth',
    secret: context.env.AUTH_SECRET,
    trustHost: true,
    session: {
      strategy: 'jwt',
      maxAge: 2 * 3600, //two hours
    },
    debug: true,
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
export const actions = [
  'providers',
  'session',
  'csrf',
  'signin',
  'signout',
  'callback',
  'verify-request',
  'error',
];

async function handleAuth(context) {
  const { next, request } = context;
  const url = new URL(request.url);
  const authOptions = await getAuthConfig(context);
  const { prefix = '/auth' } = authOptions;
  const action = url.pathname.slice(prefix.length + 1).split('/')[0];
  if (!actions.includes(action) || !url.pathname.startsWith(prefix + '/')) {
    return context.next();
  }
  const resp = await Auth(request, authOptions);
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
