import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import EnquiriesList from './enquiries-list';

export const metadata = { title: 'Enquiries — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');

  // Service-client read, scoped in code:
  //  • super_admin → all enquiries
  //  • sub-admin   → only enquiries from customers they created
  const svc = createServiceClient();

  let ownedIds: string[] | null = null;
  if (me.role !== 'super_admin') {
    const { data: mine } = await svc
      .from('customers').select('id').eq('created_by', me.id);
    ownedIds = (mine ?? []).map((c) => c.id);
  }

  let q = svc
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (sp.status) q = q.eq('status', sp.status);
  if (ownedIds !== null) {
    // sub-admin with zero customers → no enquiries
    q = q.in('customer_id', ownedIds.length > 0 ? ownedIds : ['00000000-0000-0000-0000-000000000000']);
  }

  const { data: enquiries } = await q;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-primary" />
          Enquiries
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {enquiries?.length ?? 0} enquiries · log of all WhatsApp orders
        </p>
      </div>

      <EnquiriesList enquiries={(enquiries ?? []) as any} initialStatus={sp.status ?? ''} />
    </div>
  );
}
