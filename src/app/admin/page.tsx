import Link from 'next/link';
import {
  Package,
  Users,
  Tag,
  FolderTree,
  PackageX,
  Plus,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';

export const metadata = { title: 'Dashboard — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');

  // Service-client reads (bypass RLS), so dashboard always shows real counts.
  const supabase = createServiceClient();

  const [{ count: totalProducts }, { count: published }, { count: outOfStock }, { count: totalCategories }, { count: totalCustomers }, { count: activeCustomers }, { count: totalBrands }] =
    await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock_status', 'out_of_stock'),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
    ]);

  const stats = [
    {
      label: 'Products',
      value: totalProducts ?? 0,
      sub: `${published ?? 0} published`,
      icon: Package,
      color: 'from-primary to-primary-600',
      href: '/admin/products',
    },
    {
      label: 'Categories',
      value: totalCategories ?? 0,
      sub: 'active',
      icon: FolderTree,
      color: 'from-secondary to-secondary-600',
      href: '/admin/categories',
    },
    {
      label: 'Brands',
      value: totalBrands ?? 0,
      sub: 'active',
      icon: Tag,
      color: 'from-dark to-dark-700',
      href: '/admin/brands',
    },
    {
      label: 'Customers',
      value: totalCustomers ?? 0,
      sub: `${activeCustomers ?? 0} active`,
      icon: Users,
      color: 'from-accent to-accent-600',
      href: '/admin/customers',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your wholesale platform</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-card border border-slate-200/60 hover:shadow-premium transition"
            >
              <div
                className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-2xl group-hover:opacity-20 transition`}
              />
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-dark tabular-nums">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-slate-400 mt-2">{s.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Alerts row */}
      {(outOfStock ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-danger/5 border border-danger/20 p-4">
          <PackageX className="h-5 w-5 text-danger" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-danger">{outOfStock} products out of stock</span>
            <span className="text-slate-500"> — review inventory</span>
          </div>
          <Link
            href="/admin/products?stock=out_of_stock"
            className="text-sm font-medium text-danger hover:underline"
          >
            Review →
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-2xl bg-white shadow-card border border-slate-200/60 p-5">
        <h2 className="font-semibold text-dark text-sm mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-dark hover:bg-slate-50 transition">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Link>
          <Link href="/admin/customers"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-dark hover:bg-slate-50 transition">
            <Users className="h-3.5 w-3.5" /> Manage Customers
          </Link>
          <Link href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-dark hover:bg-slate-50 transition">
            <Package className="h-3.5 w-3.5" /> View Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
