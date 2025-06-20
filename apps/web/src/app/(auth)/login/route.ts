import { generateState } from 'arctic';
import { discord } from '@/lib/oauth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { globalGETRateLimit, tooManyRequests } from '@/lib/request';

// TODO: add any other needed scopes
const SCOPES = [
  // get current user
  'identify',
  // get list of current user's guilds
  'guilds',
];

export async function GET() {
  if (!(await globalGETRateLimit())) return tooManyRequests();
  const cookieStore = await cookies();
  const state = generateState();
  // TODO: check out the `codeVerifier` prop
  const url = discord.createAuthorizationURL(state, null, SCOPES);

  cookieStore.set('github_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  return redirect(url.toString());
}
