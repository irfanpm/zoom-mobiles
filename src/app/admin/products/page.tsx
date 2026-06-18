import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import ProductsTable from './products-table';
import Pagination from '@/components/admin/Pagination';

export const metadata = { title: 'Products — Admin' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; brand?: string; stock?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  const supabase = createServiceClient();

  const page = Math.max(1, Number(sp.page) || 1);
  const fromRow = (page - 1) * PAGE_SIZE;
  const toRow = fromRow + PAGE_SIZE - 1;

  // `count: 'exact'` returns the total matching rows for pagination math.
  let query = supabase
    .from('products')
    .select(
      'id, code, name, image_url, wholesale_price, stock_qty, stock_status, is_published, show_price, category_id, brand_id, sort_order, categories(name, slug), brands(name, slug)',
      { count: 'exact' },
    )
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(fromRow, toRow);

  if (sp.q) query = query.or(`code.ilike.%${sp.q}%,name.ilike.%${sp.q}%`);
  if (sp.category) query = query.eq('category_id', sp.category);
  if (sp.brand === '__none__') query = query.is('brand_id', null);
  else if (sp.brand) query = query.eq('brand_id', sp.brand);
  if (sp.stock) query = query.eq('stock_status', sp.stock);

  const [{ data: products, count }, { data: categories }, { data: brands }] = await Promise.all([
    query,
    supabase.from('categories').select('id, name').order('sort_order'),
    supabase.from('brands').select('id, name').order('sort_order'),
  ]);

  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" />
            Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} products · Manage your full catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      {/* Filter bar */}
      <form className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-slate-200 p-3 shadow-card">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Search by code or name…"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          name="category"
          defaultValue={sp.category ?? ''}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All categories</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="brand"
          defaultValue={sp.brand ?? ''}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All brands</option>
          <option value="__none__">⚠️ No brand assigned</option>
          {(brands ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          name="stock"
          defaultValue={sp.stock ?? ''}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-dark-700 transition"
        >
          <Filter className="h-3.5 w-3.5" /> Apply
        </button>
      </form>

      <ProductsTable products={(products ?? []) as any} />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/admin/products"
        params={{ q: sp.q, category: sp.category, brand: sp.brand, stock: sp.stock }}
      />
    </div>
  );
}
