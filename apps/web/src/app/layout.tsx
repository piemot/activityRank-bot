import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource-variable/recursive/mono.css';
import './globals.css';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'ActivityRank',
  description: '',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: https://www.npmjs.com/package/next-themes#with-app
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider enableSystem>{children}</ThemeProvider>
      </body>
    </html>
  );
}
