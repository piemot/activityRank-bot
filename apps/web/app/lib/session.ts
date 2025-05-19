import { manager } from './database.js';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

// based on Lucia: https://lucia-auth.com/sessions/basic-api/mysql

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    // in one month
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
    .where('id', '=', sessionId)
    .executeTakeFirst();
  // no active session
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
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    // session is expired
    await manager.db.deleteFrom('session').where('id', '=', session.id).execute();
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    // session needs to be renewed
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await manager.db
      .updateTable('session')
      .set({ expires_at: session.expiresAt })
      .where('id', '=', session.id)
      .execute();
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await manager.db.deleteFrom('session').where('id', '=', sessionId).execute();
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await manager.db.deleteFrom('session').where('user_id', '=', userId).execute();
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface User {
  id: string;
  username: string;
}
