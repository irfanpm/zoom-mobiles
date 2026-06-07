import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './login-form';

export const metadata = { title: 'Customer Login — Zoom Mobiles' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, route them to the right place
  if (user) {
    const { data: admin } = await supabase
      .from('admin_users').select('id').eq('id', user.id).maybeSingle();
    if (admin) redirect('/admin');
    redirect(sp.redirect ?? '/products');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh-primary px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-grid-slate [background-size:32px_32px] opacity-50" />
      <LoginForm redirectTo={sp.redirect ?? '/products'} />
    </div>
  );
}
