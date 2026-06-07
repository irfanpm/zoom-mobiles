import { MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EnquiriesList from './enquiries-list';

export const metadata = { title: 'Enquiries — Admin' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (sp.status) q = q.eq('status', sp.status);

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
