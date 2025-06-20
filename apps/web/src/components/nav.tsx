'use client';

import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  SquareArrowOutUpRight,
  List,
  X as XIcon,
  Sun,
  MoonStar,
  Monitor,
} from 'lucide-react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import Logo from '@/assets/logo.svg';
import GithubLogo from '@/assets/brand/github.svg';
import { cn } from '@/lib/util';
import { useTheme } from 'next-themes';
import { useIsMounted } from 'usehooks-ts';

interface NavigationEntry {
  name: string;
  href: string;
  external: boolean;
  active: boolean;
}

function useNavigation() {
  const pathname = usePathname();

  const nav = (name: string, href: string, external: boolean): NavigationEntry => ({
    name,
    href,
    external,
    // remove trailing slashes
    active: pathname.replace(/\/+$/, '') === href,
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
        href={props.href}
        className={cn(
          'flex gap-2 items-center px-4 py-2',
          props.active && 'text-theme-800 dark:text-theme-400',
        )}
      >
        {props.name}
        {props.external && <SquareArrowOutUpRight className="size-4" />}
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
            <XIcon className="size-6 stroke-slate-700 dark:stroke-slate-300" />
          </button>
          <div className="h-0.5 w-full bg-theme-700 dark:bg-slate-600" />
          <nav className="flex flex-col pt-2">
            {navigation.map((nav) => (
              <HeaderLink key={nav.href} {...nav} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col">
          <Link
            href="/github"
            className="mx-auto flex items-center gap-1 pb-2 text-sm text-slate-600 dark:text-slate-400"
          >
            <GithubLogo className="size-4" />
            <span className="font-mono">{process.env.COMMIT_HASH}</span>
          </Link>
          <div className="flex w-full p-4 pt-2">
            <Link
              href="/login"
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

function DarkModeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  function Item(props: { theme: 'light' | 'dark' | 'system'; children: ReactNode }) {
    return (
      <button
        type="button"
        onClick={() => setTheme(props.theme)}
        className="flex w-full rounded-md items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 data-focus:bg-slate-100 hover:bg-slate-100 dark:data-focus:bg-slate-800 dark:hover:bg-slate-800 data-focus:text-slate-900 hover:text-slate-900 dark:data-focus:text-slate-100 dark:hover:text-slate-100 data-focus:outline-hidden"
      >
        {props.children}
      </button>
    );
  }

  return (
    <Menu>
      <MenuButton>
        {isMounted() &&
          (resolvedTheme === 'dark' ? (
            <MoonStar className="size-5 mx-2" />
          ) : (
            <Sun className="size-5 mx-2" />
          ))}
      </MenuButton>
      <MenuItems
        anchor="bottom"
        className="mt-2 p-1 w-36 z-10 origin-top-right rounded-lg bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <MenuItem>
          <Item theme="light">
            <Sun />
            Light
          </Item>
        </MenuItem>
        <MenuItem>
          <Item theme="dark">
            <MoonStar />
            Dark
          </Item>
        </MenuItem>
        <MenuItem>
          <Item theme="system">
            <Monitor />
            System
          </Item>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = useNavigation();

  function HeaderLink(props: NavigationEntry) {
    return (
      <li>
        <Link
          href={props.href}
          className={cn(
            'flex items-center gap-1 text-slate-800 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-400',
            props.active &&
              'text-theme-800 dark:text-theme-400 hover:text-theme-700 dark:hover:text-theme-200',
          )}
        >
          {props.name}
          {props.external && <SquareArrowOutUpRight className="size-4" />}
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
        <Link href="/" className="m-1 p-1 size-10">
          <Logo className="size-full" />
        </Link>
        <nav className="flex-1">
          <ul className="hidden md:flex gap-4">
            {navigation.map((nav) => (
              <HeaderLink key={nav.href} {...nav} />
            ))}
          </ul>
        </nav>
        <DarkModeSwitcher />
        <Link href="/login" className="flex gap-1 items-center mx-2">
          <span>Log In</span>
          <ArrowRight className="size-4" />
        </Link>
      </header>
      <MobileDialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
        <MobileDialog onClose={() => setIsOpen(false)} user={null} />
      </MobileDialogWrapper>
    </>
  );
}
