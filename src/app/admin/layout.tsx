import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';

export const metadata = {
  title: 'Admin — Zoom Mobiles',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    // /admin/login legitimately renders without a session — pass through.
    // Any other admin route without a valid ACTIVE admin (e.g. account was
    // disabled while the middleware role-cookie is still warm) → force login.
    const h = await headers();
    const pathname = h.get('x-pathname') ?? '';
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      redirect('/admin/login?error=not_admin');
    }
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar role={admin.role} />
      <div className="lg:pl-64">
        <AdminHeader adminName={admin.full_name} adminRole={admin.role} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
