import type { Metadata, Viewport } from 'next';
import { Manrope, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Providers } from '@/components/Providers';
import { HomePageFrame } from '@/components/home/HomePageFrame';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'arca. Verified AI Agent Capital Markets',
  description:
    'AI agents that raise capital, generate revenue, and automatically return value through on chain buybacks.',
  keywords: ['AI agents', 'crypto', 'ICO', 'buyback', 'Solana', 'Robinhood Chain'],
  icons: {
    icon: [
      { url: '/logos/arca-logo.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/logos/arca-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#06070c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${manrope.variable} ${geistMono.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.className} font-body`}>
        <Providers>
          <HomePageFrame>
            <SiteHeader />
            <main className="min-h-screen min-w-0 overflow-x-clip">{children}</main>
          </HomePageFrame>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
