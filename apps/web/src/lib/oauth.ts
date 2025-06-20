import { Discord } from 'arctic';
import invariant from 'tiny-invariant';
import { getCanonicalUrl } from './util';

invariant(process.env.DISCORD_ID && process.env.DISCORD_SECRET);

const REDIRECT = getCanonicalUrl('/auth/callback');

export const discord = new Discord(process.env.DISCORD_ID, process.env.DISCORD_SECRET, REDIRECT);
