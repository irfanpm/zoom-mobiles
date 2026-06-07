import Link from 'next/link';
import {
  Package,
  Users,
  MessageSquare,
  FolderTree,
  TrendingUp,
  PackageX,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Dashboard — Admin' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: totalProducts }, { count: published }, { count: outOfStock }, { count: totalCategories }, { count: totalCustomers }, { count: activeCustomers }, { count: totalEnquiries }, { count: newEnquiries }, { data: recentEnquiries }] =
    await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock_status', 'out_of_stock'),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('enquiries').select('*', { count: 'exact', head: true }),
      supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('enquiries').select('id, customer_snapshot, items, status, created_at').order('created_at', { ascending: false }).limit(5),
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
      label: 'Customers',
      value: totalCustomers ?? 0,
      sub: `${activeCustomers ?? 0} active`,
      icon: Users,
      color: 'from-accent to-accent-600',
      href: '/admin/customers',
    },
    {
      label: 'Enquiries',
      value: totalEnquiries ?? 0,
      sub: `${newEnquiries ?? 0} new`,
      icon: MessageSquare,
      color: 'from-dark to-dark-700',
      href: '/admin/enquiries',
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

      {/* Recent enquiries */}
      <div className="rounded-2xl bg-white shadow-card border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-dark flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Enquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest 5 from customers</p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {(recentEnquiries ?? []).length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No enquiries yet.
            </div>
          ) : (
            (recentEnquiries ?? []).map((e: any) => (
              <Link
                key={e.id}
                href={`/admin/enquiries#${e.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 transition"
              >
                <div className="min-w-0">
                  <div className="font-medium text-dark text-sm truncate">
                    {e.customer_snapshot?.full_name ?? 'Guest customer'}
                    {e.customer_snapshot?.company_name && (
                      <span className="text-slate-500"> · {e.customer_snapshot.company_name}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {Array.isArray(e.items) ? e.items.length : 0} items · {new Date(e.created_at).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    e.status === 'new'
                      ? 'bg-primary/10 text-primary'
                      : e.status === 'contacted'
                        ? 'bg-secondary/10 text-secondary'
                        : e.status === 'converted'
                          ? 'bg-success/10 text-success'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {e.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
