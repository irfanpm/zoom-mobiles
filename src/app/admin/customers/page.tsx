import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CustomersManager from './customers-manager';

export const metadata = { title: 'Customers — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const [
    { data: customers },
    { data: brands },
    { data: access },
  ] = await Promise.all([
    supabase.from('customers').select('*').order('created_at', { ascending: false }),
    supabase.from('brands').select('id, name, slug, logo_url').eq('is_active', true).order('sort_order'),
    supabase.from('customer_brand_access').select('customer_id, brand_id, can_view, can_enquire'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Customers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {customers?.length ?? 0} customers · only people you add here can log in
        </p>
      </div>
      <CustomersManager
        customers={(customers ?? []) as any}
        brands={(brands ?? []) as any}
        accessRows={(access ?? []) as any}
      />
    </div>
  );
}
