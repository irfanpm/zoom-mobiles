'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// ── CUSTOMER LOGIN ────────────────────────────────────────────────
export async function loginCustomer(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirect') ?? '/products');

  if (!email || !password) {
    return { error: 'Please enter email and password.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Invalid email or password.' };
  }

  // Make sure they're a customer (not admin trying to login on wrong page)
  const { data: customer } = await supabase
    .from('customers')
    .select('id, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!customer) {
    await supabase.auth.signOut();
    return { error: 'This account is not a registered customer.' };
  }
  if (!customer.is_active) {
    await supabase.auth.signOut();
    return { error: 'Your account has been disabled. Please contact Zoom Mobiles.' };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

// ── ADMIN LOGIN ───────────────────────────────────────────────────
export async function loginAdmin(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirect') ?? '/admin');

  if (!email || !password) {
    return { error: 'Please enter email and password.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Invalid email or password.' };
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }
  if (admin.is_active === false) {
    await supabase.auth.signOut();
    return { error: 'Your admin account has been disabled. Contact the super admin.' };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

// ── LOGOUT ────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Clear the perf-cache role cookie (set by middleware) so a different
  // user logging in on the same device doesn't inherit admin status.
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('zm_role');
  revalidatePath('/', 'layout');
  redirect('/login');
}

// ── ADMIN: CREATE CUSTOMER ────────────────────────────────────────
export async function createCustomer(formData: FormData) {
  let me;
  try {
    const { requireAdmin } = await import('@/lib/auth/admin-guard');
    ({ admin: me } = await requireAdmin('customers_add'));
  } catch (e: any) {
    return { error: e.message };
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const full_name = String(formData.get('full_name') ?? '').trim();
  const company_name = String(formData.get('company_name') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const city = String(formData.get('city') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!email || !password || !full_name) {
    return { error: 'Email, password and name are required.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  // service-role client — bypasses RLS, lets us create a user
  const admin_db = createServiceClient();

  const { data: created, error: authErr } = await admin_db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, company_name },
  });

  if (authErr || !created.user) {
    return { error: authErr?.message ?? 'Failed to create user.' };
  }

  const baseRow = {
    id: created.user.id,
    full_name,
    company_name,
    phone,
    email,
    city,
    notes,
    is_active: true,
  };

  // Try with ownership column; if `created_by` doesn't exist yet (migration 008
  // not run), retry without it so customer creation still works.
  let rowErr = (await admin_db.from('customers').insert({ ...baseRow, created_by: me.id })).error;
  if (rowErr && /created_by/.test(rowErr.message)) {
    rowErr = (await admin_db.from('customers').insert(baseRow)).error;
  }

  if (rowErr) {
    await admin_db.auth.admin.deleteUser(created.user.id);
    return { error: rowErr.message };
  }

  revalidatePath('/admin/customers');
  return { success: true, credentials: { email, password } };
}

// ── ADMIN: UPDATE CUSTOMER (incl. reset password) ─────────────────
export async function updateCustomer(formData: FormData) {
  let me;
  try {
    const { requireAdmin } = await import('@/lib/auth/admin-guard');
    ({ admin: me } = await requireAdmin('customers_edit'));
  } catch (e: any) {
    return { error: e.message };
  }

  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing customer id' };

  // Ownership check: sub-admin may only edit customers they created
  if (me.role !== 'super_admin') {
    const ownCheck = createServiceClient();
    const { data: row } = await ownCheck
      .from('customers').select('created_by').eq('id', id).maybeSingle();
    if (!row || row.created_by !== me.id) {
      return { error: 'You can only edit customers you created.' };
    }
  }

  const full_name = String(formData.get('full_name') ?? '').trim();
  const company_name = String(formData.get('company_name') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const city = String(formData.get('city') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const is_active = formData.get('is_active') === 'on';
  const new_password = String(formData.get('new_password') ?? '');

  // Super admin can reassign the customer to another admin ("Assigned To").
  const assignTo = String(formData.get('assign_to') ?? '').trim();

  const admin_db = createServiceClient();

  const updateData: Record<string, unknown> = {
    full_name, company_name, phone, city, notes, is_active,
  };
  if (me.role === 'super_admin' && assignTo) {
    updateData.created_by = assignTo;
  }

  let rowErr = (await admin_db.from('customers').update(updateData).eq('id', id)).error;
  // If created_by column missing (pre-migration) AND the admin tried to assign,
  // surface a clear, actionable error instead of silently dropping it.
  if (rowErr && /created_by/.test(rowErr.message)) {
    if (updateData.created_by) {
      return {
        error:
          'Customer assignment needs a database update. Run this once in Supabase SQL Editor:  ' +
          'alter table public.customers add column if not exists created_by uuid references public.admin_users(id); ' +
          "notify pgrst, 'reload schema';",
      };
    }
    delete updateData.created_by;
    rowErr = (await admin_db.from('customers').update(updateData).eq('id', id)).error;
  }

  if (rowErr) return { error: rowErr.message };

  if (new_password) {
    if (new_password.length < 6) {
      return { error: 'New password must be at least 6 characters.' };
    }
    const { error: pwErr } = await admin_db.auth.admin.updateUserById(id, {
      password: new_password,
    });
    if (pwErr) return { error: pwErr.message };
  }

  revalidatePath('/admin/customers');
  revalidatePath('/', 'layout'); // WhatsApp routing may have changed owner
  return { success: true, new_password: new_password || undefined };
}

// ── ADMIN: DELETE CUSTOMER ────────────────────────────────────────
export async function deleteCustomer(id: string) {
  let me;
  try {
    const { requireAdmin } = await import('@/lib/auth/admin-guard');
    ({ admin: me } = await requireAdmin('customers_delete'));
  } catch (e: any) {
    return { error: e.message };
  }

  const admin_db = createServiceClient();

  // Ownership check: sub-admin may only delete customers they created
  if (me.role !== 'super_admin') {
    const { data: row } = await admin_db
      .from('customers').select('created_by').eq('id', id).maybeSingle();
    if (!row || row.created_by !== me.id) {
      return { error: 'You can only delete customers you created.' };
    }
  }

  const { error } = await admin_db.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath('/admin/customers');
  return { success: true };
}
