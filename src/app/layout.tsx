import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SettingsProvider } from '@/components/providers/SettingsProvider';
import LazyFloatingEnquiryBar from '@/components/enquiry/LazyFloatingEnquiryBar';
import { fetchSettings, resolveCustomerWhatsApp } from '@/lib/catalog';
import { siteConfig } from '@/lib/config';
import './globals.css';

// System font stack — no network needed at build time. Matches Inter's look
// (Apple uses SF, Windows uses Segoe UI, modern browsers fall back to system-ui).
// To self-host Inter later, install @next/font + place .woff2 in /public/fonts.

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

/**
 * Cache the layout for 60s. Admin edits trigger `revalidatePath('/', 'layout')`
 * in `saveSettings` so changes are visible within a few seconds — and customer
 * navigation stays instant because the layout is reused across page transitions.
 */
export const revalidate = 60;

/** Convert "#00C853" → "0 200 83" (RGB triplet for Tailwind alpha support). */
function hexToRgbTriplet(hex: string | null | undefined, fallback: string): string {
  const v = (hex ?? '').trim();
  const m = /^#?([0-9a-fA-F]{6})$/.exec(v);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Try to fetch live settings; fall back gracefully if Supabase isn't configured yet
  let settings;
  let theme = { primary: '0 200 83', secondary: '0 102 255', accent: '255 184 0' };
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
      logo_url: s.logo_url ?? null,
    };
    theme = {
      primary: hexToRgbTriplet(s.theme_primary, '0 200 83'),
      secondary: hexToRgbTriplet(s.theme_secondary, '0 102 255'),
      accent: hexToRgbTriplet(s.theme_accent, '255 184 0'),
    };

    // Per-admin routing: if a logged-in customer belongs to an admin with their
    // own WhatsApp number, route ALL their enquiries to that admin's number.
    try {
      const adminWa = await resolveCustomerWhatsApp();
      if (adminWa) {
        settings.whatsapp_number = adminWa.whatsapp_number;
        settings.whatsapp_display = adminWa.whatsapp_display;
      }
    } catch {
      // ignore — keep global number
    }
  } catch {
    settings = {
      whatsapp_number: siteConfig.whatsappNumber,
      whatsapp_display: siteConfig.whatsappDisplay,
      company_name: siteConfig.name,
      tagline: siteConfig.tagline,
      email: siteConfig.email,
      phone: siteConfig.phone,
      address: siteConfig.address,
      logo_url: null,
    };
  }

  // Skip consumer chrome on admin & auth pages — they have their own layouts
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  const isBareRoute =
    pathname.startsWith('/admin') ||
    pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Live theme from Appearance editor (super admin) — overrides Tailwind brand colors */}
        <style>{`:root{--brand-primary:${theme.primary};--brand-secondary:${theme.secondary};--brand-accent:${theme.accent};}`}</style>
      </head>
      <body className="min-h-dvh bg-background flex flex-col" suppressHydrationWarning>
        <SettingsProvider value={settings}>
          {isBareRoute ? (
            <main className="flex-1">{children}</main>
          ) : (
            <>
              <Header />
              <main className="flex-1 pb-32">{children}</main>
              <Footer />
              <LazyFloatingEnquiryBar />
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
