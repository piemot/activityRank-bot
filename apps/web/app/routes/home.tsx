import type { Route } from './+types/home';
import { Plus, GithubLogo } from '@phosphor-icons/react';
import logo from '~/assets/logo.svg';
import backgroundLight from '~/assets/background-light.svg';
import backgroundDark from '~/assets/background-dark.svg';
import { NavBar } from '~/components/nav';
import { useDarkMode, useIsClient } from 'usehooks-ts';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'ActivityRank' }, { name: 'description', content: 'ActivityRank | Home' }];
}

export default function Home() {
  const { isDarkMode } = useDarkMode({
    initializeWithValue: typeof document !== 'undefined',
    localStorageKey: 'darkMode',
  });
  const isClient = useIsClient();
  const background = isDarkMode ? backgroundDark : backgroundLight;

  return (
    <div className="flex flex-col items-center justify-center h-full *:z-10">
      {isClient && (
        <img
          src={background}
          alt=""
          loading="lazy"
          className="fixed top-0 left-0 w-full h-full"
          style={{ filter: 'opacity(25%) blur(60px)' }}
        />
      )}
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-12">
          <img src={logo} alt="ActivityRank" className="w-32 md:w-48" />
          <h1 className="font-semibold text-4xl md:text-6xl/relaxed text-transparent bg-clip-text bg-gradient-to-b from-theme-700 to-theme-800 dark:from-theme-200 dark:to-theme-400">
            ActivityRank
          </h1>
          <a
            href="/invite"
            className="flex items-center gap-2 font-semibold text-xl px-12 py-4 rounded-xl bg-gradient-to-r from-theme-200 to-theme-400 text-slate-800"
          >
            Invite
            <Plus weight="bold" className="size-4" />
          </a>
        </div>
      </main>
      <footer className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] mb-2 px-4 w-full justify-items-center text-slate-600 dark:text-slate-400">
        <div className="hidden md:block" />
        <div className="flex md:grid md:grid-cols-3 w-full max-w-lg text-sm justify-between justify-items-center">
          <a href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-500">
            Privacy Policy
          </a>
          <a href="/about" className="hover:text-slate-700 dark:hover:text-slate-500">
            About
          </a>
          <a href="/terms" className="hover:text-slate-700 dark:hover:text-slate-500">
            Terms and Conditions
          </a>
        </div>
        <a
          href="/github"
          className="hidden md:flex justify-self-end gap-1 items-center font-mono text-sm hover:text-slate-700 dark:hover:text-slate-500"
        >
          <GithubLogo className="size-4" />
          {__COMMIT_HASH__}
        </a>
      </footer>
    </div>
  );
}
