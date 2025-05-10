import { Fragment, useState, type PropsWithChildren } from 'react';
import { ArrowRight, ArrowSquareOut, List, GithubLogo, X as XIcon } from '@phosphor-icons/react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import logo from '~/assets/logo.svg';
import { cn } from '~/lib/util';
import { Link, useLocation } from 'react-router';

interface NavigationEntry {
  name: string;
  to: string;
  external: boolean;
  active: boolean;
}

function useNavigation() {
  const location = useLocation();

  const nav = (name: string, to: string, external: boolean): NavigationEntry => ({
    name,
    to,
    external,
    // remove trailing slashes
    active: location.pathname.replace(/\/+$/, '') === to,
  });

  const navigation: NavigationEntry[] = [
    nav('FAQ', '/faq', false),
    nav('Patchnotes', '/patchnotes', false),
    nav('Support', '/support', true),
    nav('Premium', '/premium', true),
  ];

  return navigation;
}

function MobileDialogWrapper(
  props: PropsWithChildren<{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }>,
) {
  // Holds transitions to slide in mobile menu and fade-in backdrop
  return (
    <Transition show={props.isOpen}>
      <Dialog onClose={() => props.setIsOpen(false)} className="relative z-50">
        <TransitionChild>
          <div
            className={cn(
              'fixed inset-0 dark:bg-slate-900/30 opacity-100 backdrop-blur-sm transition-opacity',
              'transition ease-in duration-200 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-300',
            )}
            aria-hidden="true"
          />
        </TransitionChild>
        <TransitionChild>
          <div
            className={cn(
              'fixed inset-0 flex translate-x-0 items-start overflow-y-auto',
              'transition ease-in-out data-closed:-translate-x-full data-enter:duration-100 data-leave:duration-300',
            )}
          >
            {props.children}
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

function MobileDialog(props: { onClose: () => void; user: null }) {
  const navigation = useNavigation();

  function HeaderLink(props: NavigationEntry) {
    return (
      <Link
        to={props.to}
        className={cn(
          'flex gap-2 items-center px-4 py-2',
          props.active && 'text-theme-800 dark:text-theme-400',
        )}
      >
        {props.name}
        {props.external && <ArrowSquareOut />}
      </Link>
    );
  }

  return (
    <DialogPanel className="min-h-full w-[min(20rem,calc(100vw-theme(spacing.10)))] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 shadow-2xl transition">
      <DialogTitle className="sr-only">Navigation</DialogTitle>
      <div className="flex min-h-screen flex-col justify-between">
        <div className="flex flex-col">
          <button
            type="button"
            className="flex h-14 items-center px-4 "
            onClick={() => props.onClose()}
          >
            <XIcon className="size-6 stroke-slate-300" />
          </button>
          <div className="h-0.5 w-full bg-theme-700 dark:bg-slate-600" />
          <nav className="flex flex-col pt-2">
            {navigation.map((nav) => (
              <HeaderLink key={nav.to} {...nav} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col">
          <Link
            to="/github"
            className="mx-auto flex items-center gap-1 pb-2 text-sm text-slate-600 dark:text-slate-400"
          >
            <GithubLogo className="h-4" />
            <span className="font-mono">{__COMMIT_HASH__}</span>
          </Link>
          <div className="flex w-full p-4 pt-2">
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-theme-700 to-theme-800 dark:from-theme-200 dark:to-theme-400 py-2 text-slate-200 dark:text-slate-900"
            >
              <span>{props.user ? 'Dashboard' : 'Log In'}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </DialogPanel>
  );
}

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = useNavigation();

  function HeaderLink(props: NavigationEntry) {
    return (
      <li>
        <Link
          to={props.to}
          className={cn(
            'flex items-center gap-1 text-slate-800 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-400',
            props.active &&
              'text-theme-800 dark:text-theme-400 hover:text-theme-700 dark:hover:text-theme-200',
          )}
        >
          {props.name}
          {props.external && <ArrowSquareOut />}
        </Link>
      </li>
    );
  }

  return (
    <>
      <header className="flex w-full items-center shadow-md text-slate-800 dark:text-slate-200 dark:border-b dark:border-slate-700">
        <div className="block md:hidden my-1 ml-1 p-2 size-12">
          <List className="size-full" onClick={() => setIsOpen(true)} />
        </div>
        <a href="/" className="m-1 p-1 size-10">
          <img className="h-full" src={logo} alt="ActivityRank" />
        </a>
        <nav className="flex-1">
          <ul className="hidden md:flex gap-4">
            {navigation.map((nav) => (
              <HeaderLink key={nav.to} {...nav} />
            ))}
          </ul>
        </nav>
        <a href="/login" className="flex gap-1 items-center mx-2">
          <span>Log In</span>
          <ArrowRight className="size-4" />
        </a>
      </header>
      <MobileDialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
        <MobileDialog onClose={() => setIsOpen(false)} user={null} />
      </MobileDialogWrapper>
    </>
  );
}
