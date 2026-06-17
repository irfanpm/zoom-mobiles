import { redirect } from 'next/navigation';
import { Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import AppearanceForm from './appearance-form';

export const metadata = { title: 'Appearance — Admin' };
export const dynamic = 'force-dynamic';

export default async function AppearancePage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  if (me.role !== 'super_admin') redirect('/admin'); // super admin only

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('settings').select('*').eq('id', 1).single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <Palette className="h-7 w-7 text-primary" />
          Appearance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Logo · company name · color theme · about page — super admin only
        </p>
      </div>
      <AppearanceForm settings={settings as any} />
    </div>
  );
}
