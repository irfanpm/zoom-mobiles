'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, Menu, X, Activity, ShoppingBag } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/config';
import { cn } from '@/lib/utils';
import { useEnquiryStore } from '@/store/enquiry-store';
import { useSettings } from '@/components/providers/SettingsProvider';
import AuthControls from './AuthControls';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/products' },
  { label: 'About', href: '/about' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useEnquiryStore((s) => s.items);
  const settings = useSettings();
  // siteConfig retained as a static-import fallback to avoid lint complaints
  void siteConfig;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-dark-200/70 shadow-soft'
            : 'bg-white/60 backdrop-blur-md border-b border-transparent'
        )}
      >
        <div className="container-fluid">
          <div className="flex h-16 lg:h-[72px] items-center justify-between gap-4">
            <Link href="/products" className="flex items-center" aria-label="Zoom Mobiles">
              <Logo />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-dark-700 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-1.5 chip bg-primary/10 text-primary-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <Activity className="h-3 w-3" />
                Live Stock
              </div>
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link href="/products">
                  <Search className="h-4 w-4" />
                  Browse Inventory
                </Link>
              </Button>
              <Button asChild variant="whatsapp" size="sm">
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              {items.length > 0 && (
                <Button asChild variant="default" size="sm">
                  <Link href="/enquiry">
                    <ShoppingBag className="h-4 w-4" />
                    {items.length}
                  </Link>
                </Button>
              )}
              <AuthControls className="ml-1" />
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg bg-dark-100 text-dark-800"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-dark-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-premium flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-200">
                <Logo />
                <button
                  type="button"
                  className="h-10 w-10 rounded-lg bg-dark-100 inline-flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-1">
                  {NAV.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl text-base font-semibold text-dark-800 hover:bg-dark-100"
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/products">
                      <Search className="h-4 w-4" />
                      View Products
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="lg" variant="whatsapp">
                    <a
                      href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Order on WhatsApp
                    </a>
                  </Button>
                </div>
                <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-center gap-2 text-primary-700 font-semibold text-sm">
                    <Activity className="h-4 w-4" /> Live Stock Updates
                  </div>
                  <p className="text-xs text-dark-600 mt-1">
                    Real-time inventory from our wholesale warehouse.
                  </p>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
