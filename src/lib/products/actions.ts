'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { StockStatus } from '@/lib/supabase/types';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (!admin) throw new Error('Admin access required');
  return supabase;
}

function bool(v: FormDataEntryValue | null) {
  return v === 'on' || v === 'true';
}
function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ── CREATE / UPDATE PRODUCT ───────────────────────────────────────
export async function saveProduct(formData: FormData) {
  const supabase = await requireAdmin();

  const id = String(formData.get('id') ?? '');
  const code = String(formData.get('code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const category_id = String(formData.get('category_id') ?? '') || null;
  const brand_id = String(formData.get('brand_id') ?? '') || null;

  // Resolve brand text from the selected brand (for backward compat with old `brand` column).
  let brand: string | null = null;
  if (brand_id) {
    const { data: brandRow } = await supabase
      .from('brands')
      .select('name')
      .eq('id', brand_id)
      .maybeSingle();
    brand = brandRow?.name ?? null;
  }

  const wholesale_price = num(formData.get('wholesale_price'));
  const moq = num(formData.get('moq')) ?? 1;
  const box_qty = num(formData.get('box_qty')) ?? 1;
  const stock_qty = num(formData.get('stock_qty')) ?? 0;
  const stock_status = (String(formData.get('stock_status') ?? 'in_stock')) as StockStatus;

  const image_url = String(formData.get('image_url') ?? '').trim() || null;
  const galleryRaw = String(formData.get('gallery') ?? '');
  const gallery: string[] = galleryRaw
    ? galleryRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const tagsRaw = String(formData.get('tags') ?? '');
  const tags: string[] = tagsRaw
    ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const sort_order = num(formData.get('sort_order')) ?? 0;

  const row = {
    code,
    name,
    description,
    category_id,
    brand_id,
    brand,
    wholesale_price,
    moq,
    box_qty,
    stock_qty,
    stock_status,
    image_url,
    gallery,
    tags,
    is_featured: bool(formData.get('is_featured')),
    is_new_launch: bool(formData.get('is_new_launch')),
    is_fast_selling: bool(formData.get('is_fast_selling')),
    show_price: bool(formData.get('show_price')),
    show_stock: bool(formData.get('show_stock')),
    show_moq: bool(formData.get('show_moq')),
    show_box_qty: bool(formData.get('show_box_qty')),
    is_published: bool(formData.get('is_published')),
    sort_order,
  };

  if (!code || !name) {
    return { error: 'Product code and name are required.' };
  }

  if (id) {
    const { error } = await supabase.from('products').update(row).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('products').insert(row);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/products');
  redirect('/admin/products');
}

// ── DELETE ────────────────────────────────────────────────────────
export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true };
}

// ── TOGGLE FIELDS QUICKLY ─────────────────────────────────────────
export async function toggleProductField(
  id: string,
  field: 'is_published' | 'show_price' | 'show_stock' | 'show_moq' | 'show_box_qty',
  value: boolean,
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from('products').update({ [field]: value }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true };
}

// ── UPLOAD IMAGE ──────────────────────────────────────────────────
export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await requireAdmin();
  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file uploaded' };
  if (file.size > 4 * 1024 * 1024) return { error: 'Image must be ≤ 4 MB' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase
    .storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (upErr) return { error: upErr.message };

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return { url: data.publicUrl };
}
