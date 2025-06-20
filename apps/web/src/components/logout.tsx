'use client';

import type { ReactNode } from 'react';
import { logoutAction } from '@/app/(auth)/actions';

export function LogoutButton({ children }: { children: ReactNode }) {
  return (
    <form
      action={async () => {
        await logoutAction('/');
      }}
    >
      <button type="submit">{children ?? 'Sign Out'}</button>
    </form>
  );
}
