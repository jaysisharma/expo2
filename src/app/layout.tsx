import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import AppLayoutClient from '@/components/layout/AppLayoutClient';

export const metadata: Metadata = {
  title: 'Himalayan Hydro Expo 2027 — 5th Edition',
  description: "South Asia's apex clean energy convergence. 16–18 January 2027, Kathmandu, Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var dark = stored === 'dark';
                  var theme = dark ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (dark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
