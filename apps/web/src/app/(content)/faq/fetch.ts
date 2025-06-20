import { promises as fs } from 'node:fs';
import * as TOML from 'smol-toml';
import { z } from 'zod';
import { cachedResult } from '@/lib/util';

const FAQschema = z.object({
  faq: z.array(z.object({ name: z.string().min(1), value: z.string().min(1) })),
});

export const getFAQs = cachedResult(async () => {
  const faqContent = await fs.readFile(`${process.cwd()}/src/app/(content)/faq/faq.toml`, 'utf8');
  const data = TOML.parse(faqContent.toString());
  const faqs = FAQschema.parse(data);
  return faqs.faq;
});
