import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingEnquiryBar } from '@/components/enquiry/FloatingEnquiryBar';
import { siteConfig } from '@/lib/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'mobile accessories wholesale',
    'power banks wholesale India',
    'charging cables wholesale',
    'TWS earbuds wholesale',
    'wholesale dealer mobile parts',
    'mobile shop supplier',
    'zoom mobiles',
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: 'website',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#00C853',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background flex flex-col">
        <Header />
        <main className="flex-1 pb-32">{children}</main>
        <Footer />
        <FloatingEnquiryBar />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            className: 'font-sans',
          }}
        />
      </body>
    </html>
  );
}
