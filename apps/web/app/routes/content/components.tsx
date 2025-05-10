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
      <h1 className="text-xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200">
        {props.children}
      </h1>
      <div className="w-2/3 h-px bg-slate-400 dark:bg-slate-600" />
    </div>
  );
}

export function Section({ children }: PropsWithChildren) {
  return <section className="p-2 pb-6 [font-variant-ligatures:none]">{children}</section>;
}
export function SectionHeader({ children }: PropsWithChildren) {
  return <h2 className="pb-2 text-xl text-slate-600 dark:text-slate-400">{children}</h2>;
}
export function SectionBody({ children }: PropsWithChildren) {
  return <section className="text-slate-900 dark:text-slate-200">{children}</section>;
}
export function BulletList({ children }: PropsWithChildren) {
  return <ul className="list-disc pl-8">{children}</ul>;
}
export function List({ children }: PropsWithChildren) {
  return <ul className="pl-8">{children}</ul>;
}
export function ListEntry({ children }: PropsWithChildren) {
  return <li>{children}</li>;
}
