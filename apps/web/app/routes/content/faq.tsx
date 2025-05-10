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
          <DisclosureButton className="flex gap-1.5 w-full items-center">
            <span className="font-mono text-xs text-slate-800 dark:text-slate-400">
              {props.id}.
            </span>
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 text-left">
              {props.title}
            </span>
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

/* 

function FAQ(props: { id: number; title: string; content: string }) {
  const Component = useMemo(
    () => getMDXComponent(props.content),
    [props.content],
  );
  return (
    <div className="w-full">
      <div className="mt-4 rounded-lg bg-slate-800 p-2 text-sm md:p-4 md:text-base">
        <Disclosure>
          {({ open }) => (
            <>
              <FAQHeading open={open} {...props} />
              <FAQContent open={open}>
                <Component />
              </FAQContent>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
}

const FAQHeading = ({
  open,
  id,
  title,
}: {
  open: boolean;
  id: number;
  title: string;
}) => (
  <Disclosure.Button
    className={cx(
      'flex w-full justify-between font-light text-slate-200 transition-all',
      open ? 'pb-2 text-slate-300' : 'hover:text-slate-300',
    )}
  >
    <span>
      <span className="inline-block w-4 text-slate-400 md:w-8">{id + 1}. </span>
      <span className="">{title}</span>
    </span>
    <ChevronUpIcon
      className={cx('size-5 transition-all', open && 'rotate-180 transform')}
    />
  </Disclosure.Button>
);

const FAQContent = ({
  open,
  children,
}: PropsWithChildren<{ open: boolean }>) => (
  <AnimatePresence>
    {open && (
      <Disclosure.Panel
        as={motion.div}
        static
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        exit={{ height: 0 }}
        className="mx-4 space-y-2 overflow-hidden text-slate-200"
      >
        {children}
      </Disclosure.Panel>
    )}
  </AnimatePresence>
);

*/
