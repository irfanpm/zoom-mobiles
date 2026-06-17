'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/auth/admin-guard';
import { DEFAULT_PERMISSIONS, type AdminPermissions } from '@/lib/permissions';

// ── CREATE SUB-ADMIN ──────────────────────────────────────────────
export async function createAdmin(formData: FormData) {
  try {
    const { admin: me } = await requireSuperAdmin();

    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const full_name = String(formData.get('full_name') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim() || null;
    const whatsapp_raw = String(formData.get('whatsapp_number') ?? '').replace(/\D/g, '');
    const whatsapp_number = whatsapp_raw || null;
    const whatsapp_display = String(formData.get('whatsapp_display') ?? '').trim()
      || (whatsapp_number ? `+${whatsapp_number}` : null);

    if (!email || !password || !full_name) {
      return { error: 'Name, email and password are required.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }
    if (whatsapp_number && whatsapp_number.length < 10) {
      return { error: 'WhatsApp number must include country code (e.g. 919876543210).' };
    }

    const svc = createServiceClient();
    const { data: created, error: authErr } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (authErr || !created.user) {
      return { error: authErr?.message ?? 'Failed to create auth user.' };
    }

    const baseRow: Record<string, unknown> = {
      id: created.user.id,
      full_name,
      email,
      phone,
      whatsapp_number,
      whatsapp_display,
      role: 'admin',
      is_active: true,
      permissions: DEFAULT_PERMISSIONS, // full access on day one
      created_by: me.id,
    };

    // Retry without any columns the schema doesn't have yet (pre-migration safety).
    let rowErr = (await svc.from('admin_users').insert(baseRow)).error;
    if (rowErr) {
      const missing = /column "?([a-z_]+)"? .*does not exist|Could not find the '([a-z_]+)'/i.exec(rowErr.message);
      if (missing) {
        for (const col of ['whatsapp_number', 'whatsapp_display', 'created_by', 'phone', 'email']) {
          delete baseRow[col];
        }
        rowErr = (await svc.from('admin_users').insert(baseRow)).error;
      }
    }
    if (rowErr) {
      await svc.auth.admin.deleteUser(created.user.id);
      return { error: rowErr.message };
    }

    revalidatePath('/admin/team');
    return { success: true, credentials: { email, password } };
  } catch (e: any) {
    return { error: e.message ?? 'Unexpected error' };
  }
}

// ── UPDATE SUB-ADMIN (details / permissions / active / password) ──
export async function updateAdmin(formData: FormData) {
  try {
    const { admin: me } = await requireSuperAdmin();

    const id = String(formData.get('id') ?? '');
    if (!id) return { error: 'Missing admin id' };
    // WhatsApp (shared by both branches)
    const whatsapp_raw = String(formData.get('whatsapp_number') ?? '').replace(/\D/g, '');
    const whatsapp_number = whatsapp_raw || null;
    const whatsapp_display = String(formData.get('whatsapp_display') ?? '').trim()
      || (whatsapp_number ? `+${whatsapp_number}` : null);
    if (whatsapp_number && whatsapp_number.length < 10) {
      return { error: 'WhatsApp number must include country code (e.g. 919876543210).' };
    }

    const svc = createServiceClient();

    // Resilient update: if a column doesn't exist yet (pre-migration), strip it
    // and retry, so saving never hard-fails on a partial schema.
    async function resilientUpdate(data: Record<string, unknown>) {
      let err = (await svc.from('admin_users').update(data).eq('id', id)).error;
      let guard = 0;
      while (err && guard < 6) {
        const m = /'?([a-z_]+)'? column|column "?([a-z_]+)"?/i.exec(err.message);
        const col = m?.[1] || m?.[2];
        if (col && col in data) {
          delete data[col];
          err = (await svc.from('admin_users').update(data).eq('id', id)).error;
          guard++;
        } else {
          break;
        }
      }
      return err;
    }

    if (id === me.id) {
      // Super admin editing themselves: name/phone/whatsapp only (never lock self out)
      const err = await resilientUpdate({
        full_name: String(formData.get('full_name') ?? '').trim() || me.full_name,
        phone: String(formData.get('phone') ?? '').trim() || null,
        whatsapp_number,
        whatsapp_display,
      });
      if (err) return { error: err.message };
      revalidatePath('/admin/team');
      revalidatePath('/', 'layout');
      return { success: true };
    }

    const full_name = String(formData.get('full_name') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim() || null;
    const is_active = formData.get('is_active') === 'on';
    const new_password = String(formData.get('new_password') ?? '');
    const permissionsRaw = String(formData.get('permissions') ?? '');

    let permissions: AdminPermissions | undefined;
    if (permissionsRaw) {
      try { permissions = JSON.parse(permissionsRaw); } catch { /* ignore bad JSON */ }
    }

    const rowErr = await resilientUpdate({
      ...(full_name ? { full_name } : {}),
      phone,
      whatsapp_number,
      whatsapp_display,
      is_active,
      ...(permissions ? { permissions } : {}),
    });
    if (rowErr) return { error: rowErr.message };

    if (new_password) {
      if (new_password.length < 6) return { error: 'New password must be ≥ 6 characters.' };
      const { error: pwErr } = await svc.auth.admin.updateUserById(id, { password: new_password });
      if (pwErr) return { error: pwErr.message };
    }

    revalidatePath('/admin/team');
    return { success: true, new_password: new_password || undefined };
  } catch (e: any) {
    return { error: e.message ?? 'Unexpected error' };
  }
}

// ── DELETE SUB-ADMIN ──────────────────────────────────────────────
export async function deleteAdmin(id: string) {
  try {
    const { admin: me } = await requireSuperAdmin();
    if (id === me.id) return { error: "You can't delete your own account." };

    const svc = createServiceClient();

    // Re-assign their customers to the super admin so data isn't orphaned
    await svc.from('customers').update({ created_by: me.id }).eq('created_by', id);

    const { error } = await svc.auth.admin.deleteUser(id); // cascades to admin_users
    if (error) return { error: error.message };

    revalidatePath('/admin/team');
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? 'Unexpected error' };
  }
}
