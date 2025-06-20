interface BaseStaffInfo {
  name: string;
  username: string;
  discordId: string;
  pronouns?: string;
  role: string;
  socials: { type: 'GITHUB'; username: string }[];
}
export type StaffInfo = BaseStaffInfo & { avatarUrl: string };

const STAFF: BaseStaffInfo[] = [
  {
    name: 'piemot',
    username: 'piemot',
    discordId: '774660568728469585',
    pronouns: 'she / her',
    role: 'Lead Developer',
    socials: [{ type: 'GITHUB', username: 'piemot' }],
  },
  {
    name: 'Rapha',
    username: 'rapha01',
    discordId: '370650814223482880',
    pronouns: 'he / him',
    role: 'Owner & Former Developer',
    socials: [{ type: 'GITHUB', username: 'rapha01' }],
  },
  {
    name: 'GeheimerWolf',
    username: 'geheimerwolf',
    discordId: '270273690074087427',
    pronouns: 'he / him',
    role: 'CUSTOM',
    socials: [],
  },
  {
    name: 'LiviD',
    username: 'reezilo',
    discordId: '181725637940084736',
    pronouns: 'he / him',
    role: 'Support Staff',
    socials: [],
  },
  {
    name: 'RyXy',
    username: 'ryxy._.',
    discordId: '686422759365935105',
    role: 'Support Staff',
    socials: [],
  },
];

let users: null | StaffInfo[] = null;
let lastUpdate: Date = new Date();

export async function fetchStaffUsers(): Promise<StaffInfo[]> {
  const timeDifference = new Date().getTime() - lastUpdate.getTime();
  if (users && timeDifference < 1000 * 60 * 60) {
    return users;
  }

  console.log('Updating staff index');

  const headers = new Headers();
  headers.set('Authorization', `Bot ${process.env.DISCORD_TOKEN}`);

  async function extendStaffInfo(user: BaseStaffInfo): Promise<StaffInfo> {
    const discordUser = await fetch(`https://discord.com/api/v10/users/${user.discordId}`, {
      headers,
    }).then((res) => res.json());

    return {
      ...user,
      avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
    };
  }

  users = await Promise.all(STAFF.map(extendStaffInfo));
  lastUpdate = new Date();
  return users;
}
