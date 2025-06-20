import type { NextConfig } from 'next';
import childProcess from 'node:child_process';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const commitHash = childProcess.execSync('git log --pretty=format:"%h" -n1').toString().trim();

const nextConfig: NextConfig = {
  env: {
    APP_VERSION: pkg.version,
    COMMIT_HASH: commitHash,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/rapha01/activityRank-bot',
        permanent: false,
      },
      {
        source: '/invite',
        destination:
          'https://discord.com/api/oauth2/authorize?client_id=534589798267224065&permissions=294172224721&scope=bot%20applications.commands%20applications.commands.permissions.update',
        permanent: false,
      },
      {
        source: '/premium',
        destination: 'https://www.patreon.com/join/rapha01',
        permanent: false,
      },
      {
        source: '/support',
        destination: 'https://discord.com/invite/DE3eQ8H',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
