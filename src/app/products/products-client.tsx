'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Sparkles, Flame } from 'lucide-react';
import { FilterBar } from '@/components/products/FilterBar';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { Button } from '@/components/ui/button';
import type { Product, StockStatus } from '@/types';

// Lazy-load the modal — only loaded when a customer clicks a product detail.
// Cuts ~25kB off the initial bundle.
const ProductDetailModal = dynamic(
  () => import('@/components/products/ProductDetailModal').then((m) => ({ default: m.ProductDetailModal })),
  { ssr: false },
);

type Sort = 'name' | 'stock-high' | 'stock-low' | 'price-low' | 'price-high';

type Diagnostic = {
  totalPublished: number;
  totalBrands: number;
  restrictedBrands: number;
  unbrandedProducts: number;
} | null;

export default function ProductsClient({
  products: ALL,
  categories,
  customerName,
  diagnostic = null,
}: {
  products: Product[];
  categories: { slug: string; name: string }[];
  customerName: string | null;
  diagnostic?: Diagnostic;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<'all' | StockStatus>('all');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<Sort>('name');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) setCategory(cat);
    // Brand deep-link from home page: ?brand=<slug> → resolve to brand name
    const brandSlug = params.get('brand');
    if (brandSlug) {
      const match = ALL.find((p) => p.brandSlug === brandSlug);
      if (match) setBrand(match.brand);
    }
  }, [ALL]);

  const brands = useMemo(
    () => Array.from(new Set(ALL.map((p) => p.brand))).filter((b) => b !== '—').sort(),
    [ALL],
  );

  const filtered = useMemo(() => {
    const qRaw = query.trim().toLowerCase();
    const searchTerms = qRaw.split(/[-\s]+/).filter(Boolean);
    
    // Build a regex for each term to allow optional spaces/hyphens between characters,
    // but enforce that the match starts at a word boundary.
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const termRegexes = searchTerms.map((term) => {
      const chars = term.split('');
      const regexStr = '(?:^|[-\\s])' + chars.map((c) => escapeRegExp(c)).join('[-\\s]*');
      return new RegExp(regexStr, 'i');
    });

    let list = ALL.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (status !== 'all' && p.status !== status) return false;
      if (brand && p.brand !== brand) return false;
      if (searchTerms.length === 0) return true;
      
      const searchTarget = [
        p.name,
        p.code,
        p.brand,
        p.description,
        p.moq ? `moq ${p.moq}` : '',
        `${p.brand}${p.name}`,
        `${p.brand}${p.code}`,
        `${p.code}${p.brand}`,
        `${p.name}${p.code}`,
        p.moq ? `${p.brand}moq${p.moq}` : ''
      ].join(' ').toLowerCase();
      
      return termRegexes.every((regex) => regex.test(searchTarget));
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'name':       return a.name.localeCompare(b.name);
        case 'stock-high': return (b.availableQty ?? 0) - (a.availableQty ?? 0);
        case 'stock-low':  return (a.availableQty ?? 0) - (b.availableQty ?? 0);
        case 'price-low':  return (a.price ?? 0) - (b.price ?? 0);
        case 'price-high': return (b.price ?? 0) - (a.price ?? 0);
        default:           return 0;
      }
    });
    return list;
  }, [query, category, status, brand, sort, ALL]);

  const fastSelling = useMemo(() => ALL.filter((p) => p.isFastSelling).slice(0, 8), [ALL]);
  const newLaunches = useMemo(() => ALL.filter((p) => p.isNew).slice(0, 8), [ALL]);

  const handleView = (p: Product) => { setActive(p); setOpen(true); };
  const handleReset = () => {
    setQuery(''); setCategory('all'); setStatus('all'); setBrand(''); setSort('name');
  };

  return (
    <>
      <section className="bg-gradient-to-b from-dark-50 to-white border-b border-dark-200/70">
        <div className="container-fluid py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <span className="chip bg-primary/10 text-primary-700">
                {customerName ? `Welcome, ${customerName.split(' ')[0]}` : 'Live Inventory'}
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark-900">
                Wholesale Catalog
              </h1>
              <p className="mt-2 text-dark-600 max-w-2xl">
                Real-time stock across {ALL.length} premium products. Add to enquiry or order
                directly on WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
              <Stat label="Total SKUs" value={`${ALL.length}`} accent="text-dark-900" />
              <Stat label="In Stock" value={ALL.filter((p) => p.status === 'in-stock').length} accent="text-primary" />
              <Stat label="Low Stock" value={ALL.filter((p) => p.status === 'low-stock').length} accent="text-warning" />
              <Stat label="Out of Stock" value={ALL.filter((p) => p.status === 'out-of-stock').length} accent="text-danger" />
            </div>
          </div>
        </div>
      </section>

      <FilterBar
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        status={status}
        onStatus={setStatus}
        brand={brand}
        onBrand={setBrand}
        brands={brands}
        sort={sort}
        onSort={setSort}
        total={ALL.length}
        filtered={filtered.length}
        onReset={handleReset}
        categories={categories}
      />

      <section className="container-fluid py-8">
        {category === 'all' && !query && status === 'all' && !brand && (
          <>
            <Strip title="Fast Selling" icon={Flame}
              accent="bg-accent text-accent-foreground"
              products={fastSelling} onView={handleView} />
            <Strip title="New Launches" icon={Sparkles}
              accent="bg-secondary text-white"
              products={newLaunches} onView={handleView} />
            <div className="flex items-center gap-2 mt-12 mb-4">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-xl font-bold text-dark-900">All Products</h2>
              <span className="text-sm text-dark-500">· {filtered.length}</span>
            </div>
          </>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          ALL.length === 0 && diagnostic ? (
            <EmptyCatalog diagnostic={diagnostic} customerName={customerName} />
          ) : (
            <EmptyState onReset={handleReset} />
          )
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => <ProductCard key={p.id} product={p} onView={handleView} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <ProductDetailModal product={active} open={open} onOpenChange={setOpen} />
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-xl border border-dark-200 bg-white px-4 py-3">
      <div className={`text-2xl font-extrabold leading-none ${accent}`}>{value}</div>
      <div className="text-xs text-dark-500 mt-1">{label}</div>
    </div>
  );
}

function Strip({
  title, icon: Icon, accent, products, onView,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  products: Product[];
  onView: (p: Product) => void;
}) {
  if (!products.length) return null;
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 rounded-lg ${accent} inline-flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-dark-900">{title}</h2>
          <span className="text-sm text-dark-500">· {products.length}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} onView={onView} />)}
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-dark-300 bg-white p-16 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-dark-100 flex items-center justify-center">
        <Inbox className="h-8 w-8 text-dark-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-dark-900">No products match</h3>
      <p className="mt-1 text-sm text-dark-500 max-w-sm mx-auto">
        Try clearing some filters or searching for a different product or brand.
      </p>
      <Button className="mt-6" onClick={onReset}>Reset filters</Button>
    </div>
  );
}

/**
 * Shown when the catalog has 0 products — diagnoses the cause and tells the
 * customer exactly what's wrong (DB empty / brand restrictions / unbranded).
 */
function EmptyCatalog({
  diagnostic,
  customerName,
}: {
  diagnostic: { totalPublished: number; totalBrands: number; restrictedBrands: number; unbrandedProducts: number };
  customerName: string | null;
}) {
  const { totalPublished, totalBrands, restrictedBrands, unbrandedProducts } = diagnostic;

  let title: string;
  let message: string;
  let action: { label: string; href: string } | null = null;

  if (totalPublished === 0) {
    title = 'Catalog is being prepared';
    message = `Our team is adding products. Please check back soon — or contact us on WhatsApp for immediate enquiries.`;
  } else if (totalBrands === 0) {
    title = 'Catalog setup in progress';
    message = 'Brands are being configured. This usually takes a few minutes.';
  } else if (restrictedBrands > 0 && restrictedBrands >= totalBrands) {
    title = 'Your account has no brand access yet';
    message = `${customerName ? customerName.split(' ')[0] + ',' : 'Hi,'} you currently don't have permission to view any brands. Please contact Zoom Mobiles to request catalog access.`;
    action = {
      label: 'Request Access on WhatsApp',
      href: 'https://wa.me/919207908718?text=Hello%2C+please+enable+brand+access+for+my+account.',
    };
  } else if (unbrandedProducts === totalPublished) {
    title = 'Products need brand setup';
    message = `${totalPublished} products are published but none have a brand assigned. Restricted accounts can only see properly-branded products. Please contact us.`;
    action = {
      label: 'Notify on WhatsApp',
      href: 'https://wa.me/919207908718?text=Hello%2C+the+catalog+products+need+brand+setup.',
    };
  } else {
    title = 'No products available for your account';
    message = `${customerName ? customerName.split(' ')[0] + ',' : ''} ${restrictedBrands} of ${totalBrands} brands are restricted on your account. Contact us to expand your access.`;
    action = {
      label: 'Request More Access',
      href: 'https://wa.me/919207908718?text=Hello%2C+please+expand+my+brand+access.',
    };
  }

  return (
    <div className="rounded-2xl border border-dashed border-dark-300 bg-white p-16 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Inbox className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-dark-900">{title}</h3>
      <p className="mt-2 text-sm text-dark-500 max-w-md mx-auto">{message}</p>

      {action && (
        <Button asChild className="mt-6">
          <a href={action.href} target="_blank" rel="noopener noreferrer">
            {action.label}
          </a>
        </Button>
      )}

      {/* Discreet debug breadcrumb at the bottom — helps admin troubleshoot */}
      <div className="mt-8 pt-4 border-t border-dark-200/60 text-[10px] text-dark-400 max-w-md mx-auto">
        Diagnostics · {totalPublished} published · {totalBrands} brands ·
        {' '}{restrictedBrands} restricted · {unbrandedProducts} unbranded
      </div>
    </div>
  );
}
