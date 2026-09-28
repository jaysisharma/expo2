import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import AppLayoutClient from '@/components/layout/AppLayoutClient';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Himalayan Green Energy Expo 2027 — 5th Edition',
  description: "South Asia's apex clean energy convergence. 17–19 January 2027, Kathmandu, Nepal.",
  icons: {
    icon: [
      { url: '/images/logo.webp', type: 'image/png' },
    ],
    shortcut: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={interTight.variable} data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning className={interTight.className}>
        <ThemeProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
