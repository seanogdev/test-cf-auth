export function TeamworkProvider(options) {
  const issuer = 'https://www.teamwork.com/launchpad';
  return {
    id: 'teamwork',
    name: 'Teamwork',
    type: 'oauth',
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    client: {
      token_endpoint_auth_method: 'client_secret_post',
    },
    issuer,
    authorization: {
      url: `${issuer}/login`,
      params: { scope: 'openid projects' },
    },
    token: {
      url: `${issuer}/v1/token.json`,
      async conform(response) {
        const origBody = await response.json();
        const body = JSON.stringify({
          access_token: origBody.access_token,
          token_type: 'Bearer',
        });
        return new Response(body, response);
      },
    },
    userinfo: {
      url: `${issuer}/v1/userinfo.json`,
    },
    profile(user) {
      return {
        id: String(user['user_id']),
        name: `${user['given_name']} ${user['family_name']}`,
        email: user.email,
        image: user.picture,
      };
    },
    style: {
      bg: '#3C55BD',
      text: '#FFF',
      bgDark: '#3C55BD',
      textDark: '#FFF',
      logo: 'https://www.teamwork.com/images/logo.png',
      logoDark: 'https://www.teamwork.com/images/logo.png',
    },
  };
}
