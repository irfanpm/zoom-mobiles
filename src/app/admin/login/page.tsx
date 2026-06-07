import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLoginForm from './admin-login-form';

export const metadata = { title: 'Admin Login — Zoom Mobiles' };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (admin) redirect(sp.redirect ?? '/admin');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-dark-900 px-4 py-12">
      <div className="absolute inset-0 -z-10 opacity-30 bg-mesh-primary" />
      <div className="absolute inset-0 -z-10 bg-grid-slate [background-size:32px_32px] opacity-10" />
      <AdminLoginForm
        redirectTo={sp.redirect ?? '/admin'}
        initialError={sp.error === 'not_admin' ? 'This account does not have admin access.' : null}
      />
    </div>
  );
}
