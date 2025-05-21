import type { Route } from './+types/callback';
import { redirect } from 'react-router';
import type { OAuth2Tokens } from 'arctic';
import type { APIUser } from 'discord-api-types/v10';
import { discord, oauthState } from '~/lib/oauth';
import { manager } from '~/lib/database';
import { createSession, generateSessionToken, getSessionCookieHeaders } from '~/lib/session';

export async function loader({ request, params }: Route.LoaderArgs) {
  const code = params.code;
  const state = params.state;
  const storedState = await oauthState.parse(request.headers.get('Cookie'));

  // OAuth2 standard guarantees `code` and `state`;
  // `storedState` should exist unless the user took over 10
  // minutes (cookie expiry duration) to complete the OAuth flow.
  // `state` must be equal to `storedState` to prevent CSRF and clickjacking
  // (see https://discord.com/developers/docs/topics/oauth2#state-and-security)
  const isInvalidRequest = !code || !state || !storedState || state !== storedState;

  if (isInvalidRequest) {
    return new Response(null, { status: 400 });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await discord.validateAuthorizationCode(code, null);
  } catch (e) {
    // Invalid code or client credentials
    return new Response(null, { status: 400 });
  }

  const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });

  const discordUser: APIUser = await userResponse.json();
  const userId = discordUser.id;

  const existingUser = await manager.db
    .selectFrom('web_user')
    .select(['username', 'avatar_hash', 'id'])
    .where('id', '=', userId)
    .executeTakeFirst();

  if (existingUser) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    const headers = getSessionCookieHeaders(sessionToken, session.expiresAt);
    return redirect('/', { headers });
  }

  await manager.db
    .insertInto('web_user')
    .values({
      id: userId,
      username: discordUser.username,
      avatar_hash: discordUser.avatar,
    })
    .execute();

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, userId);
  const headers = getSessionCookieHeaders(sessionToken, session.expiresAt);
  return redirect('/', { headers });
}
