import { promises as fs } from 'node:fs';
import { z } from 'zod';
import { cachedResult } from '@/lib/util';

const featureSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
});

const patchnoteSchema = z.object({
  version: z.string().regex(/^(\d+\.)?(\d+\.)?(\d+)$/),
  // date is coerced into a date, then tranformed
  // back into an ISO string for handling server-side
  date: z.coerce.date().transform((z) => z.toISOString()),
  // the `time` field is intentionally omitted - it was never used anyways.
  title: z.string().min(1),
  desc: z.string().min(1),
  features: z.array(featureSchema),
  fixes: z.array(featureSchema),
});
export type Patchnote = z.infer<typeof patchnoteSchema>;

export const getPatchnotes = cachedResult(async () => {
  const patchnoteContent = await fs.readFile(
    `${process.cwd()}/src/app/(content)/patchnotes/patchnotes.json`,
    'utf8',
  );
  const data = JSON.parse(patchnoteContent);
  return z.array(patchnoteSchema).parse(data);
});
