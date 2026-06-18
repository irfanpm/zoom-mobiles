'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperAdmin } from '@/lib/auth/admin-guard';
import {
  MAX_IMAGE_BYTES, MAX_IMAGE_MB, ALLOWED_IMAGE_MIME, ALLOWED_IMAGE_EXT_LABEL,
} from '@/lib/config';

// ── UPLOAD BANNER IMAGE ───────────────────────────────────────────
export async function uploadBannerImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const { supabase } = await requireSuperAdmin();
    const file = formData.get('file') as File | null;
    if (!file) return { error: 'No file uploaded' };
    if (file.type && !ALLOWED_IMAGE_MIME.includes(file.type)) {
      return { error: `Unsupported type. Allowed: ${ALLOWED_IMAGE_EXT_LABEL}` };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return { error: `Banner is ${mb} MB — must be ≤ ${MAX_IMAGE_MB} MB. Compress at tinypng.com.` };
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) return { error: upErr.message };
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e: any) {
    return { error: e.message ?? 'Upload failed' };
  }
}

// ── CREATE / UPDATE BANNER ────────────────────────────────────────
export async function saveBanner(formData: FormData) {
  let supabase;
  try {
    ({ supabase } = await requireSuperAdmin());
  } catch (e: any) {
    return { error: e.message };
  }

  const id = String(formData.get('id') ?? '');
  const image_url = String(formData.get('image_url') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim() || null;
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const link_url = String(formData.get('link_url') ?? '').trim() || null;
  const sort_order = Number(formData.get('sort_order') ?? 0) || 0;
  const is_active = formData.get('is_active') !== 'off';

  if (!image_url) return { error: 'Please upload a banner image first.' };

  const row = { image_url, title, subtitle, link_url, sort_order, is_active };

  if (id) {
    const { error } = await supabase.from('banners').update(row).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('banners').insert(row);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/banners');
  revalidatePath('/', 'layout');
  return { success: true };
}

// ── DELETE BANNER ─────────────────────────────────────────────────
export async function deleteBanner(id: string) {
  let supabase;
  try {
    ({ supabase } = await requireSuperAdmin());
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/banners');
  revalidatePath('/', 'layout');
  return { success: true };
}
