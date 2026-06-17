'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin as guard } from '@/lib/auth/admin-guard';
import type { PermissionKey } from '@/lib/permissions';

async function requireAdmin(perm: PermissionKey = 'brands_manage') {
  const { supabase } = await guard(perm);
  return supabase;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function saveBrand(formData: FormData) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e: any) {
    return { error: e.message };
  }
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const slug = (String(formData.get('slug') ?? '').trim() || slugify(name));
  const description = String(formData.get('description') ?? '').trim() || null;
  const logo_url = String(formData.get('logo_url') ?? '').trim() || null;
  const sort_order = Number(formData.get('sort_order') ?? 0) || 0;
  // Checkbox semantics: present = checked = active; absent = unchecked = inactive.
  const is_active = formData.get('is_active') === 'on';

  if (!name) return { error: 'Brand name is required' };
  if (!slug) return { error: 'Slug could not be generated — enter manually.' };

  const row = { name, slug, description, logo_url, sort_order, is_active };

  if (id) {
    const { error } = await supabase.from('brands').update(row).eq('id', id);
    if (error) {
      if (error.code === '23505') {
        return { error: `Slug "${slug}" already exists. Pick a different slug or name.` };
      }
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from('brands').insert(row);
    if (error) {
      if (error.code === '23505') {
        return { error: `Slug "${slug}" already exists. Pick a different slug or name.` };
      }
      return { error: error.message };
    }
  }

  revalidatePath('/admin/brands');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true };
}

export async function deleteBrand(id: string) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/brands');
  return { success: true };
}

// ── Per-customer brand access ─────────────────────────────────────
export interface BrandAccessInput {
  brand_id: string;
  can_view: boolean;
  can_enquire: boolean;
}

/**
 * Replace the customer's brand-access whitelist.
 * Only persist rows where access is restricted (either toggle off).
 * Default rows (both true) are deleted to keep storage minimal.
 */
export async function saveCustomerBrandAccess(
  customer_id: string,
  rows: BrandAccessInput[],
) {
  let supabase;
  try {
    supabase = await requireAdmin('customers_access');
  } catch (e: any) {
    return { error: e.message };
  }
  if (!customer_id) return { error: 'Missing customer_id' };

  // Split into "restricted" (need a row) and "default" (delete the row)
  const restricted = rows.filter((r) => !r.can_view || !r.can_enquire);
  const defaults = rows.filter((r) => r.can_view && r.can_enquire);

  // Delete rows that are at default state
  if (defaults.length > 0) {
    const { error: delErr } = await supabase
      .from('customer_brand_access')
      .delete()
      .eq('customer_id', customer_id)
      .in('brand_id', defaults.map((d) => d.brand_id));
    if (delErr) return { error: delErr.message };
  }

  // Upsert restricted rows
  if (restricted.length > 0) {
    const { error: upErr } = await supabase
      .from('customer_brand_access')
      .upsert(
        restricted.map((r) => ({
          customer_id,
          brand_id: r.brand_id,
          can_view: r.can_view,
          can_enquire: r.can_enquire,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'customer_id,brand_id' },
      );
    if (upErr) return { error: upErr.message };
  }

  revalidatePath('/admin/customers');
  revalidatePath('/products');
  return { success: true };
}
