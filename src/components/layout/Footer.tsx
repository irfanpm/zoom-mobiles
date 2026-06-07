'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/lib/config';
import { useSettings } from '@/components/providers/SettingsProvider';

export function Footer() {
  const settings = useSettings();
  const waNumber = settings.whatsapp_number.replace(/\D/g, '');

  const FOOTER_LINKS = {
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/#contact' },
      { label: 'Become a Reseller', href: '#' },
      { label: 'Brand Partners', href: '#' },
    ],
    Catalog: [
      { label: 'All Products', href: '/products' },
      { label: 'New Launches', href: '/products?filter=new' },
      { label: 'Fast Selling', href: '/products?filter=fast' },
      { label: 'Out of Stock', href: '/products?status=out-of-stock' },
    ],
    Support: [
      { label: 'WhatsApp Order', href: `https://wa.me/${waNumber}` },
      { label: 'Wholesale Pricing', href: '#' },
      { label: 'Bulk Ordering', href: '#' },
      { label: 'Returns Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-dark-900 text-dark-200 mt-24">
      <div className="container-fluid py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Logo variant="white" />
            <p className="mt-4 text-sm text-dark-400 max-w-sm">
              {siteConfig.description}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a
                href={`https://wa.me/${waNumber}`}
                className="flex items-center gap-2 text-dark-300 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                {settings.whatsapp_display}
              </a>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2 text-dark-300 hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 text-dark-300 hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  {settings.email}
                </a>
              )}
              {settings.address && (
                <div className="flex items-center gap-2 text-dark-300">
                  <MapPin className="h-4 w-4" />
                  {settings.address}
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <SocialIcon href={siteConfig.social.instagram} label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.facebook} label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.youtube} label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-dark-400 hover:text-primary transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-dark-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-dark-500">
            © {new Date().getFullYear()} {settings.company_name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-dark-500">
            <Link href="#" className="hover:text-dark-200">Privacy</Link>
            <Link href="#" className="hover:text-dark-200">Terms</Link>
            <Link href="#" className="hover:text-dark-200">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-dark-800 text-dark-300 hover:bg-primary hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}
