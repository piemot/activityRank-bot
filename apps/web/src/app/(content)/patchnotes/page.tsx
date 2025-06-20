import { cn } from '@/lib/util';
import { Layout, Title } from '../components';
import { getPatchnotes } from './fetch';
import { Patchnote } from './patchnote.component';

export default async function Patchnotes() {
  const patchnotes = await getPatchnotes();
  return (
    <Layout>
      <Title>Patchnotes</Title>
      <ul className={cn('flex flex-col gap-4 w-full max-w-3xl pb-4')}>
        {patchnotes.map((note) => (
          <Patchnote key={note.version} {...note} />
        ))}
      </ul>
    </Layout>
  );
}
