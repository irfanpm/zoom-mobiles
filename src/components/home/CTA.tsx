'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/components/providers/SettingsProvider';

export function CTA() {
  const settings = useSettings();
  return (
    <section className="section">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-dark-900 p-10 sm:p-14 lg:p-20"
        >
          <div className="absolute inset-0 bg-mesh-primary opacity-50" aria-hidden />
          <div
            className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-secondary/30 blur-3xl"
            aria-hidden
          />

          <div className="relative max-w-3xl">
            <span className="chip bg-white/10 text-white">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Become a Reseller
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
              Ready to stock your shop with{' '}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-transparent">
                India&apos;s widest mobile accessories range?
              </span>
            </h2>
            <p className="mt-5 text-white/70 text-lg max-w-2xl">
              Get verified wholesale pricing, real-time stock and dedicated relationship
              manager. Onboard your shop in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="xl">
                <Link href="/products">
                  Start Buying <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="whatsapp">
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Talk to Sales
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
