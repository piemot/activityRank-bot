import type { PropsWithChildren } from 'react';
import { NavBar } from '~/components/nav';

export function Layout(props: PropsWithChildren) {
  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center h-full w-full p-2">{props.children}</main>
    </>
  );
}

export function Title(props: PropsWithChildren) {
  return (
    <div className="flex flex-col py-8 gap-4 items-center">
      <h1 className="text-xl md:text-3xl">{props.children}</h1>
      <div className="w-2/3 h-px bg-slate-400 dark:bg-slate-600" />
    </div>
  );
}
