import { redirect } from 'next/navigation';
import { Users, Search } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import CustomersManager from './customers-manager';
import Pagination from '@/components/admin/Pagination';

export const metadata = { title: 'Customers — Admin' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');

  const page = Math.max(1, Number(sp.page) || 1);
  const fromRow = (page - 1) * PAGE_SIZE;
  const toRow = fromRow + PAGE_SIZE - 1;

  // Read via service client (bypasses RLS), scope by ownership in code:
  //  • super_admin → ALL customers
  //  • sub-admin   → only customers where created_by = themselves
  const svc = createServiceClient();

  let customersQuery = svc
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(fromRow, toRow);

  if (me.role !== 'super_admin') {
    customersQuery = customersQuery.eq('created_by', me.id);
  }
  if (sp.q) {
    const term = sp.q.replace(/[-\s]+/g, '%');
    customersQuery = customersQuery.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%,phone.ilike.%${term}%`,
    );
  }

  const [
    { data: customers, count: scopedCount },
    { data: brands },
    { data: access },
    { count: totalAll },
    { data: admins },
  ] = await Promise.all([
    customersQuery,
    svc.from('brands').select('id, name, slug, logo_url').eq('is_active', true).order('sort_order'),
    svc.from('customer_brand_access').select('customer_id, brand_id, can_view, can_enquire'),
    svc.from('customers').select('*', { count: 'exact', head: true }),
    svc.from('admin_users').select('id, full_name, role').order('created_at'),
  ]);

  const ownerNames: Record<string, string> = {};
  (admins ?? []).forEach((a: any) => { ownerNames[a.id] = a.full_name; });

  const total = scopedCount ?? 0;            // total in this admin's scope (for pagination)
  const totalEverywhere = totalAll ?? 0;     // all customers in the system
  const hiddenByScope =
    me.role !== 'super_admin' && !sp.q && totalEverywhere > total;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Customers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {total} customers · only people you add here can log in
          {hiddenByScope && (
            <span className="text-slate-400">
              {' '}· {totalEverywhere - total} owned by other admins (hidden)
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <form className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-3 shadow-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Search by name, company, email or phone…"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-dark-700 transition"
        >
          <Search className="h-3.5 w-3.5" /> Search
        </button>
      </form>

      <CustomersManager
        customers={(customers ?? []) as any}
        brands={(brands ?? []) as any}
        accessRows={(access ?? []) as any}
        ownerNames={ownerNames}
        showOwner={me.role === 'super_admin'}
        admins={(admins ?? []) as any}
      />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/admin/customers"
        params={{ q: sp.q }}
      />
    </div>
  );
}
