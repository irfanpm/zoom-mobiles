'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Truck,
  Zap,
  Star,
  Sparkles,
  BatteryCharging,
  Headphones,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/config';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 lg:pt-20 pb-20">
      <div className="absolute inset-0 bg-mesh-primary opacity-70" aria-hidden />
      <div
        className="absolute inset-0 bg-grid-slate [background-size:32px_32px] mask-fade-b opacity-60"
        aria-hidden
      />
      <div className="container-fluid relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 chip bg-white shadow-soft border border-dark-200/70"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-dark-700">Live Stock Updates · {siteConfig.stats.products} SKUs</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] text-balance text-dark-900"
            >
              India&apos;s Largest{' '}
              <span className="gradient-text">Mobile Accessories</span>
              <br className="hidden sm:block" /> Wholesale Hub
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 text-base sm:text-lg text-dark-600 max-w-2xl mx-auto lg:mx-0"
            >
              Real-time inventory · Instant WhatsApp ordering · Bulk pricing for retailers
              across India. Built for serious resellers — not browsers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start"
            >
              <Button asChild size="xl" className="w-full sm:w-auto">
                <Link href="/products">
                  View Products <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="whatsapp" className="w-full sm:w-auto">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Order on WhatsApp
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs sm:text-sm text-dark-600"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Verified Wholesaler
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-secondary" /> Pan India Delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent" /> Same-day Dispatch
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-accent fill-accent" /> 4.9/5 · 10k+ Retailers
              </span>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCards() {
  return (
    <div className="relative mx-auto h-[460px] w-full max-w-md">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-64 rounded-2xl bg-white p-5 shadow-premium border border-dark-200/60"
      >
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BatteryCharging className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="chip bg-primary/10 text-primary-700">In Stock</span>
        </div>
        <h4 className="mt-3 font-semibold text-dark-900">Power Bank 20000mAh</h4>
        <p className="text-xs text-dark-500 mt-0.5">Box: 60 · Inner: 6</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-dark-900">₹980</span>
          <span className="text-xs text-dark-500">/pc · MOQ 6</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 0.3 }}
        className="absolute top-24 right-0 w-64 rounded-2xl bg-white p-5 shadow-premium border border-dark-200/60"
      >
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-blue-600" />
          </div>
          <span className="chip bg-accent/15 text-accent-700">Fast Selling</span>
        </div>
        <h4 className="mt-3 font-semibold text-dark-900">TWS HERO Earbuds</h4>
        <p className="text-xs text-dark-500 mt-0.5">30 hrs · ANC · HD Mic</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-dark-900">₹540</span>
          <span className="text-xs text-dark-500">/pc · MOQ 5</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 0.6 }}
        className="absolute bottom-0 left-6 w-72 rounded-2xl bg-dark-900 p-5 shadow-premium border border-white/10 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <span className="chip bg-accent/20 text-accent-300">New Launch</span>
        </div>
        <h4 className="mt-3 font-semibold">Smart Watch Max</h4>
        <p className="text-xs text-white/60 mt-0.5">1.85&quot; AMOLED · BT Calling</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold">₹1,450</span>
          <span className="text-xs text-white/60">/pc · MOQ 10</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        className="absolute -top-8 right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-2xl"
        aria-hidden
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute bottom-10 -right-6 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute -bottom-6 right-0 h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center shadow-glow"
      >
        <Smartphone className="h-7 w-7" />
      </motion.div>
    </div>
  );
}
