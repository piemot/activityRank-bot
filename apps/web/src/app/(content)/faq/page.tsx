import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/util';
import { getFAQs } from './fetch';
import { Layout, Title } from '../components';
import { FAQDisclosure } from './disclosure.component';

export default async function FAQ() {
  const faqs = await getFAQs();
  return (
    <Layout>
      <Title>Frequently Asked Questions</Title>
      <ul className={cn('flex flex-col gap-4 w-full max-w-3xl pb-4')}>
        {faqs.map((faq, n) => (
          <FAQItem key={faq.name} id={n + 1} title={faq.name} value={faq.value} />
        ))}
      </ul>
    </Layout>
  );
}

function timestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return `at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function FAQItem(props: { id: number; title: string; value: string }) {
  function parseCustomComponents(markdown: string): string {
    return markdown
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/<t:(\d{1,10})(?::([Rft]))?>/g, (_match, p1, p2) => {
        const ts = p1;
        const format = p2 || 'f';

        return timestamp(ts);

        // TODO: include improved Timestamp component (with tooltip mentioning that times are localised)
        // https://github.com/Luna-devv/mellow-web/blob/ecd7383fd4119a1103d5bce9f1e20e99300ac9aa/components/markdown/index.tsx#L61
        // return renderToString(
        //   <Timestamp unix={Number.parseInt(timestamp)} format={format.slice(1, -1)} />,
        // );
      });
  }

  return (
    <FAQDisclosure {...props}>
      <Markdown remarkPlugins={[remarkGfm]}>{parseCustomComponents(props.value)}</Markdown>
    </FAQDisclosure>
  );
}
