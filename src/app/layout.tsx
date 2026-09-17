import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import AppLayoutClient from '@/components/layout/AppLayoutClient';

export const metadata: Metadata = {
  title: 'Himalayan Hydro Expo 2027 — 5th Edition',
  description: "South Asia's apex clean energy convergence. 16–18 January 2027, Kathmandu, Nepal.",
  icons: {
    icon: [
      { url: '/images/logo.jpeg', type: 'image/jpeg' },
    ],
    shortcut: '/images/logo.jpeg',
    apple: '/images/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
