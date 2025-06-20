'use server';

import { globalPOSTRateLimit } from '@/lib/request';
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function logoutAction(redirectPath?: string): Promise<LogoutResult> {
  if (!(await globalPOSTRateLimit())) {
    return { code: 429, message: 'Too many requests' };
  }

  const { session } = await getCurrentSession();
  if (!session) {
    return { code: 401, message: 'Unauthorized' };
  }

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect(redirectPath ?? '/');
}

interface LogoutResult {
  code: number;
  message: string;
}
