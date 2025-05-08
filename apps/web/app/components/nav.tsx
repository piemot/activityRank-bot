import { ArrowRight, ArrowSquareOut, List } from '@phosphor-icons/react';
import logo from '~/assets/logo.svg';

export function NavBar() {
  return (
    <header className="flex w-full items-center shadow-md text-slate-800 dark:text-slate-200 dark:border-b dark:border-slate-700">
      <div className="block md:hidden my-1 ml-1 p-2 size-12">
        <List className="size-full" />
      </div>
      <a href="/" className="m-1 p-1 size-10">
        <img className="h-full" src={logo} alt="ActivityRank" />
      </a>
      <div className="flex-1">
        <ul className="hidden md:flex gap-4">
          <NavItem name="FAQ" href="/faq" />
          <NavItem name="Patchnotes" href="/patchnotes" />
          <NavItem name="Support" href="/support" external />
          <NavItem name="Premium" href="/premium" external />
        </ul>
      </div>
      <a href="/login" className="flex gap-1 items-center mx-2">
        <span>Log In</span>
        <ArrowRight className="size-4" />
      </a>
    </header>
  );
}

function NavItem(opt: { external?: boolean; name: string; href: string }) {
  return (
    <li>
      <a
        href={opt.href}
        className="flex items-center gap-1 text-slate-800 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-400"
      >
        {opt.name}
        {opt.external && <ArrowSquareOut />}
      </a>
    </li>
  );
}
