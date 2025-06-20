'use client';

import { useTheme } from 'next-themes';
import { useIsMounted } from 'usehooks-ts';
import BackgroundLight from '@/assets/background-light.svg';
import BackgroundDark from '@/assets/background-dark.svg';

export function Background() {
  const { resolvedTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  if (resolvedTheme === 'dark') {
    return (
      <BackgroundDark
        alt=""
        loading="lazy"
        className="fixed top-0 left-0 w-full h-full"
        style={{ filter: 'opacity(25%) blur(60px)' }}
      />
    );
  }
  return (
    <BackgroundLight
      alt=""
      loading="lazy"
      className="fixed top-0 left-0 w-full h-full"
      style={{ filter: 'opacity(25%) blur(60px)' }}
    />
  );
}
