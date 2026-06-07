import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * The root URL `/` is the entry point of this PRIVATE B2B portal.
 *
 * Routing rules:
 *  - Not logged in        → /login (also enforced by middleware)
 *  - Logged-in customer   → /products (catalog)
 *  - Logged-in admin      → /admin (dashboard)
 *
 * Customers never see a marketing landing page — this is a closed wholesale
 * portal where every visitor must authenticate first.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Determine whether they're an admin or a customer
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (admin) {
    redirect('/admin');
  }

  // Otherwise treat as customer
  redirect('/products');
}
