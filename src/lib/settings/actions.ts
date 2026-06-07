'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (!admin) return { error: 'Admin required' };

  const whatsapp_number = String(formData.get('whatsapp_number') ?? '')
    .replace(/\D/g, ''); // digits only
  const whatsapp_display = String(formData.get('whatsapp_display') ?? '').trim();
  const company_name = String(formData.get('company_name') ?? '').trim();
  const tagline = String(formData.get('tagline') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const address = String(formData.get('address') ?? '').trim() || null;

  if (!whatsapp_number || whatsapp_number.length < 10) {
    return { error: 'WhatsApp number must be a valid international number (e.g. 919207908718)' };
  }
  if (!company_name) {
    return { error: 'Company name is required' };
  }

  const { error } = await supabase
    .from('settings')
    .update({
      whatsapp_number,
      whatsapp_display: whatsapp_display || whatsapp_number,
      company_name,
      tagline,
      email,
      phone,
      address,
    })
    .eq('id', 1);

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}
