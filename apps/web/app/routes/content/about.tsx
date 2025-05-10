import { GithubLogo } from '@phosphor-icons/react';
import type { Route } from './+types/about';
import { Layout, Title } from './components';
import { fetchStaffUsers, type StaffInfo } from '~/lib/content/about';

function Social(params: StaffInfo['socials'][number]) {
  switch (params.type) {
    case 'GITHUB':
      return (
        <a
          href={`https://github.com/${params.username}`}
          className="size-4 text-slate-500 hover:text-slate-600"
        >
          <GithubLogo />
        </a>
      );
  }
}

function StaffInfoBlock(params: StaffInfo) {
  console.log(params);
  return (
    <div className="w-full bg-gradient-to-br from-theme-400 to-theme-700 p-1 rounded-xl">
      <li className="w-full flex flex-col md:flex-row items-center gap-2 py-4 px-2 bg-slate-300 dark:bg-slate-800 rounded-xl">
        <img src={params.avatarUrl} alt="Discord Avatar" className="p-2 rounded-full size-20" />
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="flex items-center gap-2">
            <h3 className="text-slate-800 dark:text-slate-200 font-medium text-lg pr-2">
              {params.name}
            </h3>
            {params.socials.map(Social)}
          </span>
          <span className="text-slate-500">
            <span className="font-mono">@{params.username}</span>
            {params.pronouns && <> • {params.pronouns}</>}
          </span>
        </div>
        <span className="flex-1 justify-self-end text-end text-theme-700 dark:text-theme-400 font-medium px-2">
          {params.role === 'CUSTOM' ? (
            <>
              Support Staff &{' '}
              <span className="bg-gradient-to-b from-orange-500 to-red-600 bg-clip-text text-transparent">
                Breaker of Bots
              </span>
            </>
          ) : (
            params.role
          )}
        </span>
      </li>
    </div>
  );
}

export async function loader() {
  const staff = await fetchStaffUsers();
  return { staff };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  return { ...serverData };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <Layout>
      <Title>About Us</Title>
      <ul className="w-full max-w-xl space-y-4 py-4">
        {loaderData.staff.map((staff) => (
          <StaffInfoBlock key={staff.username} {...staff} />
        ))}
      </ul>
      {/* <h2 className="text-lg md:text-2xl">Translators</h2> */}
    </Layout>
  );
}
