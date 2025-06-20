import { use } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Logo from '@/assets/logo.svg';
import GithubLogo from '@/assets/brand/github.svg';
import { NavBar } from '@/components/nav';
import { LogoutButton } from '@/components/logout';
import { getCurrentSession } from '@/lib/session';
import { Background } from './background.component';

function UserDisplay() {
  const { user } = use(getCurrentSession());

  return (
    <div>
      {user ? (
        <>
          <span>Hi, {user.username}!</span>
          <img
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatarHash}.png`}
            alt="profile"
          />
          <LogoutButton>Log out</LogoutButton>
        </>
      ) : (
        <a href="/login">Log In</a>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full *:z-10">
      <Background />
      <NavBar />
      <UserDisplay />
      <main className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-12">
          <Logo className="w-32 md:w-48" />
          <h1 className="font-semibold text-4xl md:text-6xl/relaxed text-transparent bg-clip-text bg-gradient-to-b from-theme-700 to-theme-800 dark:from-theme-200 dark:to-theme-400">
            ActivityRank
          </h1>
          <Link
            href="/invite"
            className="flex items-center gap-2 font-semibold text-xl px-12 py-4 rounded-xl bg-gradient-to-r from-theme-200 to-theme-400 text-slate-800"
          >
            Invite
            <Plus className="size-4" />
          </Link>
        </div>
      </main>
      <footer className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] mb-2 px-4 w-full justify-items-center text-slate-600 dark:text-slate-400">
        <div className="hidden md:block" />
        <div className="flex md:grid md:grid-cols-3 w-full max-w-lg text-sm justify-between justify-items-center">
          <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-500">
            Privacy Policy
          </Link>
          <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-500">
            About
          </Link>
          <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-500">
            Terms and Conditions
          </Link>
        </div>
        <Link
          href="/github"
          className="hidden md:flex justify-self-end gap-1 items-center font-mono text-sm hover:text-slate-700 dark:hover:text-slate-500"
        >
          <GithubLogo className="size-4" />
          {process.env.COMMIT_HASH}
        </Link>
      </footer>
    </div>
  );
}
