// NOTE: server-module only — never import from client components.
// (Equivalent of `import 'server-only'` without the extra dependency.)
import { cache } from 'react';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  hasPermission,
  DEFAULT_PERMISSIONS,
  type AdminProfile,
  type PermissionKey,
} from '@/lib/permissions';

/**
 * Fetch the current admin profile (deduped per request via React cache).
 * Returns null when not logged in or not an active admin.
 *
 * RESILIENCE: tries the full column set first. If newer columns
 * (whatsapp_number, permissions, is_active, …) don't exist yet because the
 * migrations haven't been run, it falls back to the base columns so a valid
 * admin is NEVER locked out. Missing fields get safe full-access defaults.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminProfile | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Attempt 1: rich select (post-migration schema)
  const rich = await supabase
    .from('admin_users')
    .select('id, full_name, email, phone, whatsapp_number, whatsapp_display, role, is_active, permissions, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!rich.error) {
    const data = rich.data as AdminProfile | null;
    if (!data || data.is_active === false) return null;
    return {
      ...data,
      permissions: data.permissions ?? DEFAULT_PERMISSIONS,
    };
  }

  // Attempt 2: base select (pre-migration schema — only original columns exist)
  const base = await supabase
    .from('admin_users')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!base.data) return null;
  return {
    id: base.data.id,
    full_name: base.data.full_name,
    role: base.data.role,
    email: null,
    phone: null,
    whatsapp_number: null,
    whatsapp_display: null,
    is_active: true,
    permissions: DEFAULT_PERMISSIONS,
  } as AdminProfile;
});

/**
 * Server-action guard. Throws when caller isn't an active admin, or when
 * `perm` is given and a sub-admin lacks it.
 *
 * Returns a SERVICE-ROLE supabase client for the write — authorization has
 * already been verified in code (getCurrentAdmin + permission check), so admin
 * writes don't depend on RLS function state. The customer-facing app still uses
 * the RLS-bound anon client; only these guarded admin actions get elevated.
 */
export async function requireAdmin(perm?: PermissionKey) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Admin access required');
  if (perm && !hasPermission(admin, perm)) {
    throw new Error('Permission denied — ask your super admin to enable this feature.');
  }
  const supabase = createServiceClient();
  return { supabase, admin };
}

/** Guard for super-admin-only actions (team management, appearance). */
export async function requireSuperAdmin() {
  const { supabase, admin } = await requireAdmin();
  if (admin.role !== 'super_admin') {
    throw new Error('Super admin access required');
  }
  return { supabase, admin };
}
