import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  fetchBanners,
  fetchVisibleCategoriesWithCounts,
  fetchVisibleBrands,
  fetchCurrentCustomer,
} from '@/lib/catalog';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

/**
 * Root URL of the private B2B portal.
 *  - Not logged in  → /login
 *  - Admin          → /admin
 *  - Customer       → home page (banners + categories + brands, access-filtered)
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (admin) redirect('/admin');

  // Customer home — everything below respects per-customer brand access
  const [banners, categories, brands, customer] = await Promise.all([
    fetchBanners(),
    fetchVisibleCategoriesWithCounts(),
    fetchVisibleBrands(),
    fetchCurrentCustomer(),
  ]);

  return (
    <HomeClient
      banners={banners as any}
      categories={categories as any}
      brands={brands as any}
      customerName={customer?.full_name ?? null}
    />
  );
}
