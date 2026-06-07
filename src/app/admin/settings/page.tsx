import { Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SettingsForm from './settings-form';

export const metadata = { title: 'Settings — Admin' };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Site-wide configuration — WhatsApp number, company info
        </p>
      </div>
      <SettingsForm settings={settings as any} />
    </div>
  );
}
