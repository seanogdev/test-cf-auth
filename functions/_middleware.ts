const baseUrl = 'https://github.com'
const authorizePath = '/login/oauth/authorize'
const scope = 'user:email,read:org'
const allowSignup = 'false'
import { Auth } from '@auth/core';
import Github from '@auth/core/providers/github';

type Env = { GH_CLIENT_ID?: string }

export async function handler ({
  request,
  env
}: {
  request: Request;
  env: Env;
})  {


  if (!env.GH_CLIENT_ID) {
    return new Error('CLIENT_ID is not set in environment')
  }

  const authorizationUrl = `${baseUrl}${authorizePath}?client_id=${env.GH_CLIENT_ID}&scope=${scope}&allow_signup=${allowSignup}`
  return {
    statusCode: 302,
    headers: {
      Location: authorizationUrl
    },
    body: null
  }
}
