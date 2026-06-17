/**
 * Per-admin permission system.
 * Super admins bypass all checks. Sub-admins are limited by their
 * `permissions` JSON (admin_users.permissions), editable from /admin/team.
 */

export const PERMISSION_DEFS = [
  { key: 'products_add',     label: 'Add products',                  group: 'Products' },
  { key: 'products_edit',    label: 'Edit products',                 group: 'Products' },
  { key: 'products_delete',  label: 'Delete products',               group: 'Products' },
  { key: 'brands_manage',    label: 'Manage brands',                 group: 'Catalog' },
  { key: 'categories_manage',label: 'Manage categories',             group: 'Catalog' },
  { key: 'customers_add',    label: 'Add customers',                 group: 'Customers' },
  { key: 'customers_edit',   label: 'Edit own customers',            group: 'Customers' },
  { key: 'customers_delete', label: 'Delete own customers',          group: 'Customers' },
  { key: 'customers_access', label: 'Manage customer brand access',  group: 'Customers' },
  { key: 'enquiries_manage', label: 'Manage enquiries',              group: 'Enquiries' },
] as const;

export type PermissionKey = (typeof PERMISSION_DEFS)[number]['key'];
export type AdminPermissions = Record<PermissionKey, boolean>;

/** New sub-admins start with EVERYTHING allowed (per business requirement). */
export const DEFAULT_PERMISSIONS: AdminPermissions = Object.fromEntries(
  PERMISSION_DEFS.map((p) => [p.key, true]),
) as AdminPermissions;

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_display: string | null;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  permissions: AdminPermissions;
  created_at?: string;
}

/** Check a permission. Super admin always passes. Missing key = allowed. */
export function hasPermission(
  admin: Pick<AdminProfile, 'role' | 'permissions'> | null | undefined,
  key: PermissionKey,
): boolean {
  if (!admin) return false;
  if (admin.role === 'super_admin') return true;
  return admin.permissions?.[key] !== false;
}
