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
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

// ── LOGOUT ────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

// ── ADMIN: CREATE CUSTOMER ────────────────────────────────────────
export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (!admin) return { error: 'Admin access required' };

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

  const { error: rowErr } = await admin_db.from('customers').insert({
    id: created.user.id,
    full_name,
    company_name,
    phone,
    email,
    city,
    notes,
    is_active: true,
  });

  if (rowErr) {
    await admin_db.auth.admin.deleteUser(created.user.id);
    return { error: rowErr.message };
  }

  revalidatePath('/admin/customers');
  return { success: true, credentials: { email, password } };
}

// ── ADMIN: UPDATE CUSTOMER (incl. reset password) ─────────────────
export async function updateCustomer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (!admin) return { error: 'Admin access required' };

  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing customer id' };

  const full_name = String(formData.get('full_name') ?? '').trim();
  const company_name = String(formData.get('company_name') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const city = String(formData.get('city') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const is_active = formData.get('is_active') === 'on';
  const new_password = String(formData.get('new_password') ?? '');

  const admin_db = createServiceClient();

  const { error: rowErr } = await admin_db
    .from('customers')
    .update({ full_name, company_name, phone, city, notes, is_active })
    .eq('id', id);

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
  return { success: true, new_password: new_password || undefined };
}

// ── ADMIN: DELETE CUSTOMER ────────────────────────────────────────
export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: admin } = await supabase
    .from('admin_users').select('id').eq('id', user.id).maybeSingle();
  if (!admin) return { error: 'Admin access required' };

  const admin_db = createServiceClient();
  const { error } = await admin_db.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath('/admin/customers');
  return { success: true };
}
