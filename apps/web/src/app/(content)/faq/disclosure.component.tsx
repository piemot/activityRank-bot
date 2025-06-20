'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { cn } from '@/lib/util';

export function timestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return `at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function FAQDisclosure(props: { id: number; title: string; children: ReactNode }) {
  return (
    <Disclosure>
      {({ open }) => (
        <li className="w-full bg-slate-300 dark:bg-slate-800 rounded-lg p-2">
          <DisclosureButton className="flex gap-1.5 w-full items-center text-slate-700 dark:text-slate-300">
            <span className="font-mono text-xs text-slate-800 dark:text-slate-400">
              {props.id}.
            </span>
            <span className="flex-1 text-sm text-left">{props.title}</span>
            <ChevronDown
              className={cn('size-4 justify-self-end transition', open && 'rotate-180')}
            />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className={cn(
              'content text-sm text-slate-800 dark:text-slate-200 ml-5 pt-2',
              'transition h-auto duration-500 data-closed:h-0',
            )}
          >
            {props.children}
          </DisclosurePanel>
        </li>
      )}
    </Disclosure>
  );
}
