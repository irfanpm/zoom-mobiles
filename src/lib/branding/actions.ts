'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperAdmin } from '@/lib/auth/admin-guard';
import {
  MAX_IMAGE_BYTES, MAX_IMAGE_MB, ALLOWED_IMAGE_MIME, ALLOWED_IMAGE_EXT_LABEL,
} from '@/lib/config';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// ── SAVE BRANDING (super admin only) ──────────────────────────────
export async function saveBranding(formData: FormData) {
  try {
    const { supabase } = await requireSuperAdmin();

    const company_name = String(formData.get('company_name') ?? '').trim();
    const tagline = String(formData.get('tagline') ?? '').trim();
    const logo_url = String(formData.get('logo_url') ?? '').trim() || null;
    const theme_primary = String(formData.get('theme_primary') ?? '').trim();
    const theme_secondary = String(formData.get('theme_secondary') ?? '').trim();
    const theme_accent = String(formData.get('theme_accent') ?? '').trim();
    const about_title = String(formData.get('about_title') ?? '').trim() || null;
    const about_content = String(formData.get('about_content') ?? '').trim() || null;

    if (!company_name) return { error: 'Company name is required.' };
    for (const [label, v] of [
      ['Primary', theme_primary], ['Secondary', theme_secondary], ['Accent', theme_accent],
    ] as const) {
      if (v && !HEX_RE.test(v)) {
        return { error: `${label} color must be a hex value like #00C853.` };
      }
    }

    const { error } = await supabase
      .from('settings')
      .update({
        company_name,
        tagline,
        logo_url,
        ...(theme_primary ? { theme_primary } : {}),
        ...(theme_secondary ? { theme_secondary } : {}),
        ...(theme_accent ? { theme_accent } : {}),
        about_title,
        about_content,
      })
      .eq('id', 1);

    if (error) return { error: error.message };

    revalidatePath('/', 'layout');
    revalidatePath('/about');
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? 'Unexpected error' };
  }
}

// ── UPLOAD LOGO ───────────────────────────────────────────────────
export async function uploadLogo(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const { supabase } = await requireSuperAdmin();
    const file = formData.get('file') as File | null;
    if (!file) return { error: 'No file uploaded' };
    if (file.type && !ALLOWED_IMAGE_MIME.includes(file.type) && file.type !== 'image/svg+xml') {
      return { error: `Unsupported type. Allowed: ${ALLOWED_IMAGE_EXT_LABEL} · SVG` };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: `Logo must be ≤ ${MAX_IMAGE_MB} MB.` };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const path = `branding/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) return { error: upErr.message };

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e: any) {
    return { error: e.message ?? 'Unexpected error' };
  }
}
