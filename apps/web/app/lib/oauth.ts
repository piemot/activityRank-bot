import { Discord } from 'arctic';
import { createCookie } from './cookie.js';
import { resolveCanonicalUrl } from './util.js';

const REDIRECT = resolveCanonicalUrl('/auth/callback');

export const discord = new Discord(
  import.meta.env.VITE_DISCORD_ID,
  import.meta.env.VITE_DISCORD_SECRET,
  REDIRECT,
);

export const oauthState = createCookie<string>('discord_oauth_state', {
  path: '/',
  httpOnly: true,
  maxAge: 60 * 10,
  sameSite: 'lax',
});
