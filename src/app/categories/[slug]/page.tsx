import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import { categories, findCategory } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import { Button } from '@/components/ui/button';
import { CategoryProductGrid } from '@/components/products/CategoryProductGrid';

export function generateStaticParams() {
  return categories.filter((c) => c.slug !== 'all').map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const cat = findCategory(params.slug);
  if (!cat) return { title: 'Category' };
  return {
    title: `${cat.name} — Wholesale Catalog`,
    description: cat.description,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = findCategory(params.slug);
  if (!cat || cat.slug === 'all') notFound();

  const products = getProductsByCategory(cat.slug);
  const Icon =
    (Icons as Record<string, React.ComponentType<{ className?: string }>>)[cat.icon] ??
    Icons.Package;

  return (
    <>
      <section className={`relative overflow-hidden bg-gradient-to-br ${cat.color}`}>
        <div className="absolute inset-0 bg-grid-slate [background-size:32px_32px] opacity-10" aria-hidden />
        <div className="container-fluid py-16 lg:py-20 text-white relative">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All categories
          </Link>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {cat.name}
              </h1>
              <p className="mt-2 text-white/80 max-w-2xl">{cat.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="chip bg-white/15 text-white">{products.length} live SKUs</span>
                <span className="chip bg-white/15 text-white">{cat.count}+ total products</span>
                <span className="chip bg-white text-dark-900">Wholesale</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-fluid py-10">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-dark-300 bg-white p-16 text-center">
            <h3 className="text-lg font-semibold text-dark-900">No products yet</h3>
            <p className="mt-1 text-sm text-dark-500">
              Our team is restocking this category. Try the full inventory.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse all products</Link>
            </Button>
          </div>
        ) : (
          <CategoryProductGrid products={products} />
        )}
      </section>
    </>
  );
}
