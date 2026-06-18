'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronLeft, ChevronRight, Tag, Sparkles, MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/providers/SettingsProvider';

type Banner = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
};
type Category = { id: string; slug: string; name: string; icon: string | null; product_count: number };
type Brand = { id: string; slug: string; name: string; logo_url: string | null };

export default function HomeClient({
  banners, categories, brands, customerName,
}: {
  banners: Banner[];
  categories: Category[];
  brands: Brand[];
  customerName: string | null;
}) {
  const settings = useSettings();
  const wa = settings.whatsapp_number.replace(/\D/g, '');

  return (
    <div className="pb-10">
      {/* Welcome strip */}
      <section className="container-fluid pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip bg-primary/10 text-primary-700">
              {customerName ? `Welcome back, ${customerName.split(' ')[0]}` : 'Wholesale Hub'}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-dark-900">
              {settings.company_name}
            </h1>
            <p className="text-dark-500 text-sm mt-1">{settings.tagline}</p>
          </div>
          <Link href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-dark-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-dark-800 transition">
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Banner carousel */}
      {banners.length > 0 && (
        <section className="container-fluid mt-6">
          <BannerCarousel banners={banners} />
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="container-fluid mt-10">
          <SectionHead icon={Tag} title="Shop by Brand" subtitle="Browse products from your available brands" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {brands.map((b, i) => (
              <motion.div key={b.id}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.02 }}>
                <Link href={`/products?brand=${b.slug}`}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dark-200/70 bg-white p-4 text-center shadow-card hover:shadow-premium hover:border-secondary/30 transition aspect-square">
                  {b.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo_url} alt={b.name} className="h-10 w-10 object-contain" />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary font-bold text-sm group-hover:scale-110 transition">
                      {b.name.charAt(0)}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-dark-700 truncate w-full">{b.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty fallback */}
      {categories.length === 0 && brands.length === 0 && (
        <section className="container-fluid mt-10">
          <div className="rounded-2xl border border-dashed border-dark-300 bg-white p-16 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-3 font-semibold text-dark-900">Catalog is being set up</h3>
            <p className="text-sm text-dark-500 mt-1 max-w-sm mx-auto">
              Your products will appear here shortly. For immediate enquiries, message us on WhatsApp.
            </p>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition">
              <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHead({ icon: Icon, title, subtitle }: {
  icon: LucideIcon; title: string; subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-dark-900 leading-tight">{title}</h2>
        <p className="text-xs text-dark-500">{subtitle}</p>
      </div>
    </div>
  );
}

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const count = banners.length;

  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);
  const prev = () => setIdx((i) => (i - 1 + count) % count);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [count, next]);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-premium aspect-[21/9] sm:aspect-[3/1] bg-dark-100">
      <AnimatePresence mode="wait">
        <motion.div key={banners[idx].id}
          initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }} className="absolute inset-0">
          <BannerSlide banner={banners[idx]} />
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button onClick={prev} aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur text-dark hover:bg-white shadow-card transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur text-dark hover:bg-white shadow-card transition">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Go to slide ${i + 1}`}
                className={cn('h-2 rounded-full transition-all', i === idx ? 'w-6 bg-white' : 'w-2 bg-white/50')} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BannerSlide({ banner }: { banner: Banner }) {
  const content = (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.image_url} alt={banner.title ?? 'banner'} className="h-full w-full object-cover" />
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/60 via-dark-900/20 to-transparent flex flex-col justify-center px-6 sm:px-12">
          {banner.title && (
            <h3 className="text-white text-xl sm:text-3xl font-extrabold max-w-lg leading-tight drop-shadow">
              {banner.title}
            </h3>
          )}
          {banner.subtitle && (
            <p className="text-white/90 text-sm sm:text-base mt-2 max-w-md drop-shadow">{banner.subtitle}</p>
          )}
          {banner.link_url && (
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow">
              Shop Now <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
  return banner.link_url ? <Link href={banner.link_url} className="block h-full">{content}</Link> : content;
}
