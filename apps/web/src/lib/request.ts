import { headers } from 'next/headers';
import { TokenBucket } from './ratelimit';

export const globalBucket = new TokenBucket<string>(100, 1);

export async function globalGETRateLimit(): Promise<boolean> {
  const headerStore = await headers();
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = headerStore.get('X-Forwarded-For');
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const headerStore = await headers();
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = headerStore.get('X-Forwarded-For');
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 3);
}

export function tooManyRequests() {
  return new Response('Too many requests', { status: 429 });
}
