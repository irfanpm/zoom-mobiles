import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingEnquiryBar } from '@/components/enquiry/FloatingEnquiryBar';
import { SettingsProvider } from '@/components/providers/SettingsProvider';
import { fetchSettings } from '@/lib/catalog';
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

/** Don't cache layout — admin can change WhatsApp number any time. */
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Try to fetch live settings; fall back gracefully if Supabase isn't configured yet
  let settings;
  try {
    const s = await fetchSettings();
    settings = {
      whatsapp_number: s.whatsapp_number,
      whatsapp_display: s.whatsapp_display,
      company_name: s.company_name,
      tagline: s.tagline,
      email: s.email,
      phone: s.phone,
      address: s.address,
    };
  } catch {
    settings = {
      whatsapp_number: siteConfig.whatsappNumber,
      whatsapp_display: siteConfig.whatsappDisplay,
      company_name: siteConfig.name,
      tagline: siteConfig.tagline,
      email: siteConfig.email,
      phone: siteConfig.phone,
      address: siteConfig.address,
    };
  }

  // Skip consumer chrome on admin & auth pages — they have their own layouts
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  const isBareRoute =
    pathname.startsWith('/admin') ||
    pathname === '/login';

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background flex flex-col" suppressHydrationWarning>
        <SettingsProvider value={settings}>
          {isBareRoute ? (
            <main className="flex-1">{children}</main>
          ) : (
            <>
              <Header />
              <main className="flex-1 pb-32">{children}</main>
              <Footer />
              <FloatingEnquiryBar />
            </>
          )}
        </SettingsProvider>
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
