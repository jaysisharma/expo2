import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import AppLayoutClient from '@/components/layout/AppLayoutClient';
import { EventStructuredData } from '@/components/seo/StructuredData';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Himalayan Green Energy Expo 2027 — 5th Edition',
  description: "South Asia's apex clean energy convergence. 17–19 January 2027, Kathmandu, Nepal.",
  keywords: [
    'Himalayan Green Energy Expo',
    'HIGEX 2027',
    'Nepal energy expo',
    'hydropower exhibition',
    'renewable energy Nepal',
    'IPPAN',
    'Bhrikutimandap',
    'Kathmandu trade show',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Himalayan Green Energy Expo 2027 — 5th Edition',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Himalayan Green Energy Expo 2027',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
        <EventStructuredData />
        <ThemeProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
