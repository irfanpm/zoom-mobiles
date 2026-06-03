'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Package,
  Smartphone,
  Truck,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-Time Inventory',
    description: 'Live stock counts updated every minute from our warehouse.',
    accent: 'from-emerald-500/15 to-teal-500/5',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: Package,
    title: 'Bulk Ordering',
    description: 'Box, inner-box & MOQ pricing built for serious retailers.',
    accent: 'from-blue-500/15 to-indigo-500/5',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Accessories',
    description: '5000+ SKUs across 200+ brands — all in one catalog.',
    accent: 'from-purple-500/15 to-pink-500/5',
    iconBg: 'bg-purple-500/10 text-purple-600',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same-day dispatch, pan-India next-day delivery to most cities.',
    accent: 'from-amber-500/15 to-orange-500/5',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Ordering',
    description: 'One tap, one message — your enquiry hits our sales desk.',
    accent: 'from-green-500/15 to-emerald-500/5',
    iconBg: 'bg-green-500/10 text-green-600',
  },
  {
    icon: RefreshCw,
    title: 'Live Stock Updates',
    description: 'Out-of-stock items are flagged instantly. No surprises.',
    accent: 'from-cyan-500/15 to-blue-500/5',
    iconBg: 'bg-cyan-500/10 text-cyan-600',
  },
];

export function Features() {
  return (
    <section className="section">
      <div className="container-fluid">
        <div className="max-w-2xl">
          <span className="chip bg-primary/10 text-primary-700">Why Zoom Mobiles</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark-900 text-balance">
            Built for the modern wholesale buyer.
          </h2>
          <p className="mt-4 text-dark-600">
            Stop chasing prices and stock counts on WhatsApp. Our digital catalog gives you
            everything a B2B buyer needs, in one premium experience.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-2xl border border-dark-200/70 bg-white p-6 card-hover overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                aria-hidden
              />
              <div className="relative">
                <div
                  className={`h-12 w-12 rounded-xl ${f.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-dark-900">{f.title}</h3>
                <p className="mt-2 text-sm text-dark-600 leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
