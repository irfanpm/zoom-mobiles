'use client';

import { motion } from 'framer-motion';
import { Package, Award, Users, Activity } from 'lucide-react';
import { siteConfig } from '@/lib/config';

const STATS = [
  { label: 'Products', value: siteConfig.stats.products, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Brands', value: siteConfig.stats.brands, icon: Award, color: 'text-secondary', bg: 'bg-secondary/10' },
  { label: 'Retail Partners', value: siteConfig.stats.retailPartners, icon: Users, color: 'text-accent', bg: 'bg-accent/15' },
  { label: 'Stock Updates', value: siteConfig.stats.stock, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

export function Stats() {
  return (
    <section className="relative -mt-8 z-10">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-dark-200/70 p-5 sm:p-6 shadow-premium"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-2xl p-4 hover:bg-dark-50 transition-colors"
            >
              <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark-900 leading-none">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-dark-500 mt-1">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
