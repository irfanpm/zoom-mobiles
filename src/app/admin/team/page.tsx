import { redirect } from 'next/navigation';
import { UsersRound } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import TeamManager from './team-manager';

export const metadata = { title: 'Team — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  if (me.role !== 'super_admin') redirect('/admin'); // sub-admins can't manage team

  // Read via service client (super-admin already verified above) — avoids any
  // RLS edge cases so the team list is always complete.
  // `select('*')` never errors on missing columns (e.g. before migration 009),
  // so the list always renders even on a partially-migrated schema.
  const svc = createServiceClient();
  const { data: admins, error } = await svc
    .from('admin_users')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('[admin/team] failed to load admins:', error.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <UsersRound className="h-7 w-7 text-primary" />
          Team
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {admins?.length ?? 0} admins · create sub-admins, control their permissions
        </p>
      </div>
      <TeamManager admins={(admins ?? []) as any} myId={me.id} />
    </div>
  );
}
