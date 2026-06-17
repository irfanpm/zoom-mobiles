'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { DbEnquiryItem, EnquiryStatus } from '@/lib/supabase/types';

// ── Customer logs an enquiry (called when "Send WhatsApp" clicked) ──
export async function logEnquiry(items: DbEnquiryItem[], message?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[logEnquiry] unauthenticated');
    return { error: 'You are not logged in. Please log in and try again.' };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Cart is empty.' };
  }

  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .select('full_name, company_name, phone, email')
    .eq('id', user.id)
    .maybeSingle();

  if (custErr) {
    console.error('[logEnquiry] customer lookup failed:', custErr);
  }

  // No customers row → user is an admin (or orphaned auth user).
  // Return a clear "skipped" so the UI can show a helpful message.
  if (!customer) {
    console.warn(`[logEnquiry] no customer row for user ${user.id} — likely admin testing`);
    return { success: true, skipped: true as const };
  }

  const { error } = await supabase.from('enquiries').insert({
    customer_id: user.id,
    customer_snapshot: customer,
    items,
    message: message ?? null,
    whatsapp_sent: true,
    status: 'new',
  });

  if (error) {
    console.error('[logEnquiry] insert failed:', error);
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath('/admin/enquiries');
  revalidatePath('/admin');
  return { success: true };
}

// ── Admin updates enquiry status ──
export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  let supabase;
  try {
    const { requireAdmin } = await import('@/lib/auth/admin-guard');
    ({ supabase } = await requireAdmin('enquiries_manage'));
  } catch (e: any) {
    return { error: e.message };
  }

  // RLS scopes this: sub-admins can only touch enquiries from their own customers
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/enquiries');
  return { success: true };
}

// ── Admin deletes enquiry ──
export async function deleteEnquiry(id: string) {
  let supabase;
  try {
    const { requireAdmin } = await import('@/lib/auth/admin-guard');
    ({ supabase } = await requireAdmin('enquiries_manage'));
  } catch (e: any) {
    return { error: e.message };
  }

  const { error } = await supabase.from('enquiries').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/enquiries');
  return { success: true };
}
