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

    // Build the update; retry stripping any column that doesn't exist yet
    // (pre-migration), so Save never hard-fails on a partial schema.
    const data: Record<string, unknown> = {
      company_name,
      tagline,
      logo_url,
      about_title,
      about_content,
      ...(theme_primary ? { theme_primary } : {}),
      ...(theme_secondary ? { theme_secondary } : {}),
      ...(theme_accent ? { theme_accent } : {}),
    };

    let error = (await supabase.from('settings').update(data).eq('id', 1)).error;
    let guard = 0;
    const droppedCols: string[] = [];
    while (error && guard < 8) {
      const m = /'?([a-z_]+)'? column|column "?([a-z_]+)"?/i.exec(error.message);
      const col = m?.[1] || m?.[2];
      if (col && col in data) {
        delete data[col];
        droppedCols.push(col);
        error = (await supabase.from('settings').update(data).eq('id', 1)).error;
        guard++;
      } else {
        break;
      }
    }

    if (error) return { error: error.message };

    revalidatePath('/', 'layout');
    revalidatePath('/about');

    // Saved, but some fields couldn't persist because their columns are missing.
    if (droppedCols.length > 0) {
      return {
        success: true,
        warning:
          `Saved logo & name. To enable ${droppedCols.join(', ')}, run in Supabase SQL Editor: ` +
          `alter table public.settings add column if not exists about_title text, ` +
          `add column if not exists about_content text, add column if not exists logo_url text; ` +
          `then Settings → API → Reload schema cache.`,
      };
    }
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
