import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),

  route('/about', 'routes/content/about.tsx'),
  route('/faq', 'routes/content/faq.tsx'),
  route('/patchnotes', 'routes/content/patchnotes.tsx'),
  route('/privacy', 'routes/content/privacy.tsx'),
  route('/terms', 'routes/content/terms.tsx'),

  route('/github', 'routes/redirects/github.ts'),
  route('/support', 'routes/redirects/support.ts'),
  route('/invite', 'routes/redirects/invite.ts'),
  route('/premium', 'routes/redirects/premium.ts'),
] satisfies RouteConfig;
