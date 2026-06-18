import { redirect } from 'next/navigation';
import { GalleryHorizontalEnd } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import BannersManager from './banners-manager';

export const metadata = { title: 'Banners — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  if (me.role !== 'super_admin') redirect('/admin');

  const svc = createServiceClient();
  const { data: banners } = await svc
    .from('banners')
    .select('*')
    .order('sort_order');

  // Categories + brands for the "link to" dropdown
  const [{ data: categories }, { data: brands }] = await Promise.all([
    svc.from('categories').select('slug, name').order('sort_order'),
    svc.from('brands').select('slug, name').eq('is_active', true).order('sort_order'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <GalleryHorizontalEnd className="h-7 w-7 text-primary" />
          Home Banners
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {banners?.length ?? 0} banners · shown in the slider on the customer home page
        </p>
      </div>
      <BannersManager
        banners={(banners ?? []) as any}
        categories={(categories ?? []) as any}
        brands={(brands ?? []) as any}
      />
    </div>
  );
}
