import { generateState } from 'arctic';
import { discord, oauthState } from '~/lib/oauth';
import { redirect } from 'react-router';

// TODO: add any other needed scopes
const SCOPES = [
  // get current user
  'identify',
  // get list of current user's guilds
  'guilds',
];

export async function loader() {
  const state = generateState();
  // TODO: check out the `codeVerifier` prop
  const url = discord.createAuthorizationURL(state, null, SCOPES);

  const headers = new Headers({ 'Set-Cookie': await oauthState.serialize(state) });
  return redirect(url.toString(), { headers });
}
