'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (!admin) throw new Error('Admin access required');
  return supabase;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function saveCategory(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const slug = (String(formData.get('slug') ?? '').trim() || slugify(name));
  const description = String(formData.get('description') ?? '').trim() || null;
  const icon = String(formData.get('icon') ?? '').trim() || 'Package';
  const sort_order = Number(formData.get('sort_order') ?? 0) || 0;

  if (!name) return { error: 'Name is required' };

  const row = { name, slug, description, icon, sort_order };

  if (id) {
    const { error } = await supabase.from('categories').update(row).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('categories').insert(row);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/products');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/categories');
  return { success: true };
}
