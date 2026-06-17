import { redirect } from 'next/navigation';
import { Tag } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import BrandsManager from './brands-manager';

export const metadata = { title: 'Brands — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  const supabase = createServiceClient();
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('sort_order');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <Tag className="h-7 w-7 text-primary" />
          Brands
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {brands?.length ?? 0} brands · used in products & per-customer access control
        </p>
      </div>
      <BrandsManager brands={(brands ?? []) as any} />
    </div>
  );
}
