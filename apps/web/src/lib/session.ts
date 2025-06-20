'use server';

import { encodeBase32LowerCase, encodeHexLowerCase } from '@oslojs/encoding';
import type { User } from './user';
import { sha256 } from '@oslojs/crypto/sha2';
import { manager } from './database';
import { cache } from 'react';
import { cookies } from 'next/headers';

// 30 days
const SESSION_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 30;
// 15 days
const SESSION_REISSUE_THRESHOLD = 1000 * 60 * 60 * 24 * 15;

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionData = await manager.db
    .selectFrom('session')
    .innerJoin('web_user', 'web_user.id', 'session.user_id')
    .select([
      'session.id as session_id',
      'session.user_id',
      'session.expires_at',
      'web_user.username',
      'web_user.avatar_hash',
    ])
    .where('session.id', '=', sessionId)
    .executeTakeFirst();

  if (!sessionData) {
    return { session: null, user: null };
  }

  const session: Session = {
    id: sessionData.session_id,
    userId: sessionData.user_id,
    expiresAt: sessionData.expires_at,
  };
  const user: User = {
    id: sessionData.user_id,
    username: sessionData.username,
    avatarHash: sessionData.avatar_hash,
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    // attempted to use an expired session
    await invalidateSession(session.id);
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - SESSION_REISSUE_THRESHOLD) {
    session.expiresAt = new Date(Date.now() + SESSION_EXPIRY_TIME);
    await manager.db
      .updateTable('session')
      .set({ expires_at: session.expiresAt })
      .where('session.id', '=', session.id)
      .executeTakeFirstOrThrow();
  }

  return { session, user };
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value ?? null;
  if (token === null) {
    return { session: null, user: null };
  }
  const result = await validateSessionToken(token);
  return result;
});

export async function invalidateSession(sessionId: string) {
  await manager.db.deleteFrom('session').where('session.id', '=', sessionId).execute();
}

export async function invalidateUserSessions(userId: string) {
  await manager.db.deleteFrom('session').where('session.user_id', '=', userId).execute();
}

export async function setSessionTokenCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
}

export async function deleteSessionTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_EXPIRY_TIME),
  };
  await manager.db
    .insertInto('session')
    .values({
      id: session.id,
      user_id: session.userId,
      expires_at: session.expiresAt,
    })
    .execute();
  return session;
}

export async function generateSessionToken(): Promise<string> {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCase(tokenBytes);
  return token;
}

export interface Session {
  /** The (random) ID of the session */
  id: string;
  /** The session owner's Discord ID */
  userId: string;
  /** The time the session is invalidated */
  expiresAt: Date;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
