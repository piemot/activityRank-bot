import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { OAuth2Tokens } from 'arctic';
import { discord } from '@/lib/oauth';
import type { APIUser } from 'discord-api-types/v10';
import { generateSessionToken, createSession, setSessionTokenCookie } from '@/lib/session';
import { createUser, getUser } from '@/lib/user';
import { globalGETRateLimit, tooManyRequests } from '@/lib/request';

const badRequest = () =>
  new Response('[Bad Request] - An error occurred. Please restart the OAuth login process.', {
    status: 400,
  });

export async function GET(request: NextRequest) {
  if (!(await globalGETRateLimit())) return tooManyRequests();

  const cookieStore = await cookies();

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const storedState = cookieStore.get('github_oauth_state')?.value ?? null;

  // OAuth2 standard guarantees `code` and `state`;
  // `storedState` should exist unless the user took over 10
  // minutes (cookie expiry duration) to complete the OAuth flow.
  // `state` must be equal to `storedState` to prevent CSRF and clickjacking
  // (see https://discord.com/developers/docs/topics/oauth2#state-and-security)
  const isInvalidRequest = !code || !state || !storedState || state !== storedState;

  if (isInvalidRequest) {
    return badRequest();
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await discord.validateAuthorizationCode(code, null);
  } catch {
    // Invalid code or client credentials
    return badRequest();
  }

  const userRequest = new Request('https://discord.com/api/v10/users/@me');
  userRequest.headers.set('Authorization', `Bearer ${tokens.accessToken()}`);
  const userResponse = await fetch(userRequest);
  const userResult: APIUser = await userResponse.json();

  const existingUser = await getUser(userResult.id);

  if (existingUser) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return redirect('/');
  }

  await createUser({
    id: userResult.id,
    username: userResult.username,
    avatarHash: userResult.avatar,
  });

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, userResult.id);
  await setSessionTokenCookie(sessionToken, session.expiresAt);
  return redirect('/');
}
