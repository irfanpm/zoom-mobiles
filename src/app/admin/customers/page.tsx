import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import CustomersManager from './customers-manager';

export const metadata = { title: 'Customers — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');

  // Read via service client (bypasses RLS), then scope by ownership in code:
  //  • super_admin → sees ALL customers
  //  • sub-admin   → sees ONLY customers where created_by = themselves.
  //    This covers both: customers the sub-admin added, AND customers the
  //    super admin assigned to them (assignment sets created_by = that admin).
  const svc = createServiceClient();

  let customersQuery = svc.from('customers').select('*').order('created_at', { ascending: false });
  if (me.role !== 'super_admin') {
    customersQuery = customersQuery.eq('created_by', me.id);
  }

  const [
    { data: customers },
    { data: brands },
    { data: access },
    { count: totalCount },
    { data: admins },
  ] = await Promise.all([
    customersQuery,
    svc.from('brands').select('id, name, slug, logo_url').eq('is_active', true).order('sort_order'),
    svc.from('customer_brand_access').select('customer_id, brand_id, can_view, can_enquire'),
    svc.from('customers').select('*', { count: 'exact', head: true }),
    svc.from('admin_users').select('id, full_name, role').order('created_at'),
  ]);

  // Map admin id → name for the "Added By" column (super admin view)
  const ownerNames: Record<string, string> = {};
  (admins ?? []).forEach((a: any) => { ownerNames[a.id] = a.full_name; });

  const shown = customers?.length ?? 0;
  const total = totalCount ?? 0;
  const hiddenByScope = me.role !== 'super_admin' && total > shown;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Customers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {shown} customers · only people you add here can log in
          {hiddenByScope && (
            <span className="text-slate-400">
              {' '}· {total - shown} owned by other admins (hidden)
            </span>
          )}
        </p>
      </div>
      <CustomersManager
        customers={(customers ?? []) as any}
        brands={(brands ?? []) as any}
        accessRows={(access ?? []) as any}
        ownerNames={ownerNames}
        showOwner={me.role === 'super_admin'}
        admins={(admins ?? []) as any}
      />
    </div>
  );
}
