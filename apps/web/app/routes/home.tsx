import type { Route } from './+types/home';
import { Plus } from '@phosphor-icons/react';
import logo from '~/assets/logo.svg';
import { NavBar } from '~/components/nav';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'ActivityRank' }, { name: 'description', content: 'ActivityRank | Home' }];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
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
      <footer className="flex mb-2 max-w-md w-full items-center justify-evenly text-sm text-slate-600 dark:text-slate-400">
        <a href="/privacy">Privacy Policy</a>
        <a href="/about">About</a>
        <a href="/terms">Terms and Conditions</a>
      </footer>
    </div>
  );
}
