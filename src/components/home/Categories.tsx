'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/categories';

export function Categories() {
  const featured = categories.filter((c) => c.slug !== 'all');

  return (
    <section id="categories" className="section bg-white">
      <div className="container-fluid">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-xl">
            <span className="chip bg-secondary/10 text-secondary-700">Shop by Category</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark-900 text-balance">
              5000+ products. Organized for fast buying.
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {featured.map((c, i) => {
            const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
              c.icon
            ] ?? Icons.Package;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Link
                  href={`/products?cat=${c.slug}`}
                  className="group relative block rounded-2xl border border-dark-200/70 bg-white p-5 card-hover overflow-hidden h-full"
                >
                  <div
                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-15 group-hover:opacity-30 transition-opacity blur-2xl`}
                    aria-hidden
                  />
                  <div className="relative">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-soft`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-semibold text-dark-900">{c.name}</h3>
                    <p className="text-xs text-dark-500 mt-0.5">{c.count}+ products</p>
                    <div className="mt-4 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
