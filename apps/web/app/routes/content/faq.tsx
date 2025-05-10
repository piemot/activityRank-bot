import type { Route } from './+types/faq';
import { useMemo } from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { Layout, Title } from './components';
import { getFAQs } from '~/lib/content/content';
import { CaretDown } from '@phosphor-icons/react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { cn } from '~/lib/util';

export async function loader() {
  const faqs = await getFAQs();
  return { faqs };
}

export default function FAQ({ loaderData }: Route.ComponentProps) {
  return (
    <Layout>
      <Title>Frequently Asked Questions</Title>
      <ul className={cn('flex flex-col gap-4 w-full max-w-3xl pb-4')}>
        {loaderData.faqs.map((faq, n) => (
          <FAQItem key={faq.name} id={n + 1} title={faq.name} bundleCode={faq.bundle.code} />
        ))}
      </ul>
    </Layout>
  );
}

function FAQItem(props: { id: number; title: string; bundleCode: string }) {
  const timestamp = (ts: number) => {
    const date = new Date(ts * 1000);
    return `at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies(timestamp): local fn
  const BodyComponent = useMemo(
    () => getMDXComponent(props.bundleCode, { timestamp }),
    [props.bundleCode],
  );

  return (
    <Disclosure>
      {({ open }) => (
        <li className="w-full bg-slate-300 dark:bg-slate-800 rounded-lg p-2">
          <DisclosureButton className="flex gap-1.5 w-full items-center text-slate-700 dark:text-slate-300">
            <span className="font-mono text-xs text-slate-800 dark:text-slate-400">
              {props.id}.
            </span>
            <span className="flex-1 text-sm text-left">{props.title}</span>
            <CaretDown className={cn('size-4 justify-self-end transition', open && 'rotate-180')} />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className={cn(
              'content text-sm text-slate-800 dark:text-slate-200 ml-5 pt-2',
              'transition h-auto duration-500 data-closed:h-0',
            )}
          >
            <BodyComponent />
          </DisclosurePanel>
        </li>
      )}
    </Disclosure>
  );
}
