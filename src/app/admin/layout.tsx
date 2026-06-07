import type { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Admin — Zoom Mobiles',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let admin = null;
  if (user) {
    const { data } = await supabase
      .from('admin_users')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle();
    admin = data;
  }

  // If we're on /admin/login the middleware doesn't gate us; render without shell.
  // We detect by checking if admin row exists.
  if (!admin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader adminName={admin.full_name} adminRole={admin.role} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
