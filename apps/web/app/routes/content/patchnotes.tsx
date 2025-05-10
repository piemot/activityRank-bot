import type { Route } from './+types/patchnotes';
import { Layout, Title } from './components';
import { getPatchnotes, type Patchnote } from '~/lib/content/content';
import { CaretDown } from '@phosphor-icons/react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { cn } from '~/lib/util';

export async function loader() {
  const patchnotes = await getPatchnotes();
  return { patchnotes };
}

export default function Patchnotes({ loaderData }: Route.ComponentProps) {
  return (
    <Layout>
      <Title>Patchnotes</Title>
      <ul className={cn('flex flex-col gap-4 w-full max-w-3xl pb-4')}>
        {loaderData.patchnotes.map((note) => (
          <PatchnoteItem key={note.version} patchnote={note} />
        ))}
      </ul>
    </Layout>
  );
}

function PatchnoteItem({ patchnote }: { patchnote: Patchnote }) {
  return (
    <Disclosure>
      {({ open }) => (
        <li className="w-full bg-slate-300 dark:bg-slate-800 rounded-lg p-2">
          <DisclosureButton className="flex gap-1.5 w-full items-center">
            <span className="font-mono text-xs text-slate-800 dark:text-slate-400">
              {patchnote.version}
            </span>
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 text-left">
              {patchnote.title}
            </span>
            <CaretDown className={cn('size-4 justify-self-end transition', open && 'rotate-180')} />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className={cn(
              'text-sm text-slate-800 dark:text-slate-200 ml-5 pt-2 space-y-2',
              'transition h-auto duration-500 data-closed:h-0',
            )}
          >
            <span className="text-slate-500 dark:text-slate-400">
              {new Date(patchnote.date).toDateString()}
            </span>
            <p>{patchnote.desc}</p>
            <h3 className="text-slate-500 font-semibold pt-2 dark:text-slate-400">Features</h3>
            {patchnote.features.length > 0 ? (
              <ul className="md:pl-4 space-y-2">
                {patchnote.features.map((entry) => (
                  <li key={entry.title}>
                    <span className="bg-gradient-to-b from-theme-400 to-theme-800 dark:from-theme-200 dark:to-theme-400 bg-clip-text pt-4 text-sm text-transparent">
                      {entry.title}
                    </span>
                    <p>{entry.desc}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-red-800 dark:text-red-200">No features in this update</span>
            )}
            <h3 className="text-slate-500 font-semibold pt-2 dark:text-slate-400">Bug Fixes</h3>
            {patchnote.fixes.length > 0 ? (
              <ul className="md:pl-4 space-y-2">
                {patchnote.fixes.map((entry) => (
                  <li key={entry.title}>
                    <span className="bg-gradient-to-b from-theme-400 to-theme-800 dark:from-theme-200 dark:to-theme-400 bg-clip-text pt-4 text-sm text-transparent">
                      {entry.title}
                    </span>
                    <p>{entry.desc}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-red-800 dark:text-red-200">No bug fixes in this update</span>
            )}
          </DisclosurePanel>
        </li>
      )}
    </Disclosure>
  );
}
