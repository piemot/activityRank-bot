import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { execSync } from 'node:child_process';

// run a CLI process to get the latest git hash
const __COMMIT_HASH__ =
  process.env.GIT_COMMIT && process.env.GIT_COMMIT !== 'unspecified'
    ? process.env.GIT_COMMIT
    : (execSync('git log --format=%h -n1').toString().trim() ?? 'xxxxxxx');

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  define: {
    __COMMIT_HASH__: JSON.stringify(__COMMIT_HASH__),
  },
});
