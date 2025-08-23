import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Tecno Gamerz Hub',
    default: 'Tecno Gamerz Hub - Gaming Platform',
  },
  description: 'The ultimate gaming platform for tournaments, content, and community',
  keywords: ['gaming', 'esports', 'tournaments', 'streaming', 'community'],
  authors: [{ name: 'Tecno Gamerz Hub Team' }],
  creator: 'Tecno Gamerz Hub',
  publisher: 'Tecno Gamerz Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.WEB_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.WEB_URL || 'http://localhost:3000',
    siteName: 'Tecno Gamerz Hub',
    title: 'Tecno Gamerz Hub - Gaming Platform',
    description: 'The ultimate gaming platform for tournaments, content, and community',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tecno Gamerz Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tecno Gamerz Hub - Gaming Platform',
    description: 'The ultimate gaming platform for tournaments, content, and community',
    images: ['/og-image.png'],
    creator: '@tecnogamerzhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}