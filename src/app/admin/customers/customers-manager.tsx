'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Save,
  X,
  KeyRound,
  Copy,
  CheckCircle2,
  Phone,
  Building,
  AlertCircle,
  ShieldCheck,
  Tag,
  Eye,
  EyeOff,
  MessageCircle,
  MessageCircleOff,
} from 'lucide-react';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/auth/actions';
import { saveCustomerBrandAccess, type BrandAccessInput } from '@/lib/brands/actions';

type Customer = {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
};

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

type AccessRow = {
  customer_id: string;
  brand_id: string;
  can_view: boolean;
  can_enquire: boolean;
};

export default function CustomersManager({
  customers,
  brands,
  accessRows,
  ownerNames = {},
  showOwner = false,
  admins = [],
}: {
  customers: Customer[];
  brands: Brand[];
  accessRows: AccessRow[];
  /** Map of admin id → admin name, for the "Added By" column. */
  ownerNames?: Record<string, string>;
  /** Show the "Added By" column + reassign dropdown (super admin only). */
  showOwner?: boolean;
  /** List of admins for the "Assigned To" reassign dropdown (super admin). */
  admins?: { id: string; full_name: string; role: string }[];
}) {
  const [items, setItems] = useState(customers);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [accessFor, setAccessFor] = useState<Customer | null>(null);
  const [creating, setCreating] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState<{ email: string; password: string } | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Build lookup: customer_id → restriction count
  const restrictionCount = useMemo(() => {
    const map = new Map<string, number>();
    accessRows.forEach((r) => {
      if (!r.can_view || !r.can_enquire) {
        map.set(r.customer_id, (map.get(r.customer_id) ?? 0) + 1);
      }
    });
    return map;
  }, [accessRows]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createCustomer(fd);
      if (res?.error) { setError(res.error); return; }
      if (res?.credentials) {
        setCredentialsModal(res.credentials);
        setCreating(false);
        window.location.reload();
      }
    });
  }

  async function onUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateCustomer(fd);
      if (res?.error) { setError(res.error); return; }
      if (res?.new_password) {
        setCredentialsModal({
          email: editing?.email ?? '',
          password: res.new_password,
        });
      }
      setEditing(null);
      window.location.reload();
    });
  }

  function onDelete(c: Customer) {
    if (!confirm(`Delete customer "${c.full_name}"? This revokes their login forever.`)) return;
    start(async () => {
      const res = await deleteCustomer(c.id);
      if (res?.error) alert(res.error);
      else setItems((p) => p.filter((x) => x.id !== c.id));
    });
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="font-semibold text-dark text-sm">All Customers</h2>
          <button
            onClick={() => { setCreating(true); setError(null); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-600 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Customer
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            No customers yet. Add your first one — they&apos;ll receive login credentials.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Customer</th>
                  <th className="text-left font-medium px-4 py-3">Contact</th>
                  {showOwner && <th className="text-left font-medium px-4 py-3">Added By</th>}
                  <th className="text-center font-medium px-4 py-3">Access</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((c) => {
                  const restrictions = restrictionCount.get(c.id) ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold">
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-dark truncate">{c.full_name}</div>
                            {c.company_name && (
                              <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                <Building className="h-3 w-3" /> {c.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="truncate">{c.email}</div>
                        {c.phone && (
                          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </div>
                        )}
                      </td>
                      {showOwner && (
                        <td className="px-4 py-3 text-xs">
                          {c.created_by && ownerNames[c.created_by] ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/5 border border-secondary/20 px-2 py-0.5 text-secondary font-medium">
                              <ShieldCheck className="h-3 w-3" />
                              {ownerNames[c.created_by]}
                            </span>
                          ) : (
                            <span className="text-slate-400">— unassigned</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {restrictions > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {restrictions} restricted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            Full access
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            c.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setAccessFor(c)}
                            className="inline-flex h-8 px-2 items-center gap-1 rounded-lg border border-secondary/30 bg-secondary/5 text-secondary text-xs font-semibold hover:bg-secondary/10 transition"
                            title="Brand access"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Access
                          </button>
                          <button
                            onClick={() => { setEditing(c); setError(null); }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                            aria-label="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            disabled={pending}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-danger/5 hover:text-danger hover:border-danger/20 transition"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {creating && (
          <Modal onClose={() => setCreating(false)} title="Add New Customer" subtitle="They'll be able to log in with these credentials">
            <form onSubmit={onCreate} className="space-y-3">
              <Input name="full_name" label="Full Name *" required />
              <Input name="company_name" label="Company Name" />
              <Input name="email" label="Email *" type="email" required />
              <Input name="password" label="Password *" type="text" required placeholder="At least 6 characters" />
              <div className="grid grid-cols-2 gap-3">
                <Input name="phone" label="Phone" />
                <Input name="city" label="City" />
              </div>
              <Input name="notes" label="Notes (admin only)" />

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {pending ? 'Creating…' : 'Create Customer & Generate Login'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <Modal onClose={() => setEditing(null)} title={`Edit: ${editing.full_name}`} subtitle="Leave password blank to keep current">
            <form onSubmit={onUpdate} className="space-y-3">
              <input type="hidden" name="id" value={editing.id} />
              <Input name="full_name" label="Full Name *" required defaultValue={editing.full_name} />
              <Input name="company_name" label="Company Name" defaultValue={editing.company_name ?? ''} />
              <div className="grid grid-cols-2 gap-3">
                <Input name="phone" label="Phone" defaultValue={editing.phone ?? ''} />
                <Input name="city" label="City" defaultValue={editing.city ?? ''} />
              </div>
              <Input name="notes" label="Notes (admin only)" defaultValue={editing.notes ?? ''} />
              <Input name="new_password" label="Reset password (optional)" placeholder="New password (leave blank to keep)" />

              {showOwner && admins.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-dark-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                    Assigned To (admin who manages this customer)
                  </label>
                  <select
                    name="assign_to"
                    defaultValue={editing.created_by ?? ''}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">— Unassigned —</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name}{a.role === 'super_admin' ? ' (Super Admin)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Reassign this customer to another admin. Their enquiries will route to that admin&apos;s WhatsApp.
                  </p>
                </div>
              )}

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-dark-700">Customer is active</span>
                <span className="relative">
                  <input type="checkbox" name="is_active" defaultChecked={editing.is_active} className="peer sr-only" />
                  <span className="block h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-primary" />
                  <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {pending ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* BRAND ACCESS MODAL */}
      <AnimatePresence>
        {accessFor && (
          <BrandAccessModal
            customer={accessFor}
            brands={brands}
            initialAccess={accessRows.filter((a) => a.customer_id === accessFor.id)}
            onClose={() => setAccessFor(null)}
            onSaved={() => { setAccessFor(null); window.location.reload(); }}
          />
        )}
      </AnimatePresence>

      {/* CREDENTIALS MODAL */}
      <AnimatePresence>
        {credentialsModal && (
          <Modal
            onClose={() => setCredentialsModal(null)}
            title="✅ Login Credentials"
            subtitle="Share these with your customer (this is shown only once)"
          >
            <CredentialBox email={credentialsModal.email} password={credentialsModal.password} />
            <button
              onClick={() => setCredentialsModal(null)}
              className="mt-4 w-full rounded-xl bg-dark px-4 py-3 text-sm font-semibold text-white hover:bg-dark-700 transition"
            >
              Got it
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// ── BRAND ACCESS MODAL ────────────────────────────────────────────
function BrandAccessModal({
  customer,
  brands,
  initialAccess,
  onClose,
  onSaved,
}: {
  customer: Customer;
  brands: Brand[];
  initialAccess: AccessRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  // Build state: for each brand, what's the current (can_view, can_enquire)?
  const initialState = useMemo(() => {
    const map = new Map<string, { can_view: boolean; can_enquire: boolean }>();
    brands.forEach((b) => {
      const row = initialAccess.find((a) => a.brand_id === b.id);
      map.set(b.id, {
        can_view: row?.can_view ?? true,
        can_enquire: row?.can_enquire ?? true,
      });
    });
    return map;
  }, [brands, initialAccess]);

  const [state, setState] = useState(initialState);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function patch(brandId: string, key: 'can_view' | 'can_enquire', value: boolean) {
    setState((prev) => {
      const next = new Map(prev);
      const cur = next.get(brandId) ?? { can_view: true, can_enquire: true };
      const updated = { ...cur, [key]: value };
      // If view is off, force enquire off too (can't enquire what you can't see)
      if (key === 'can_view' && !value) updated.can_enquire = false;
      next.set(brandId, updated);
      return next;
    });
  }

  function toggleAll(value: boolean) {
    setState(() => {
      const next = new Map<string, { can_view: boolean; can_enquire: boolean }>();
      brands.forEach((b) => next.set(b.id, { can_view: value, can_enquire: value }));
      return next;
    });
  }

  function onSave() {
    setError(null);
    const rows: BrandAccessInput[] = brands.map((b) => {
      const v = state.get(b.id) ?? { can_view: true, can_enquire: true };
      return { brand_id: b.id, can_view: v.can_view, can_enquire: v.can_enquire };
    });
    start(async () => {
      const res = await saveCustomerBrandAccess(customer.id, rows);
      if (res?.error) setError(res.error);
      else onSaved();
    });
  }

  const restrictedCount = Array.from(state.values()).filter(
    (v) => !v.can_view || !v.can_enquire,
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-premium overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-dark flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              Brand Access — {customer.full_name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {restrictedCount === 0
                ? `${customer.full_name.split(' ')[0]} sees & can enquire all brands.`
                : `${restrictedCount} of ${brands.length} brands have restrictions.`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-dark">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 hover:bg-primary/5 hover:border-primary/20 transition"
            >
              <CheckCircle2 className="h-3 w-3 text-primary" /> Allow all
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 hover:bg-danger/5 hover:border-danger/20 transition"
            >
              <EyeOff className="h-3 w-3 text-danger" /> Block all
            </button>
            <span className="ml-auto text-slate-500 hidden sm:inline">
              View = appears in catalog · Enquiry = can send WhatsApp
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {brands.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              <Tag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              No brands defined yet. <a href="/admin/brands" className="text-primary underline">Add brands first</a>.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {brands.map((b) => {
                const v = state.get(b.id) ?? { can_view: true, can_enquire: true };
                return (
                  <li key={b.id} className="flex items-center gap-3 p-3 hover:bg-slate-50/50 rounded-lg transition">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {b.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logo_url} alt={b.name} className="h-full w-full object-cover" />
                      ) : (
                        <Tag className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-dark text-sm">{b.name}</div>
                      <div className="text-[10px] text-slate-400">/{b.slug}</div>
                    </div>
                    <ToggleChip
                      icon={v.can_view ? Eye : EyeOff}
                      label="View"
                      active={v.can_view}
                      onClick={() => patch(b.id, 'can_view', !v.can_view)}
                    />
                    <ToggleChip
                      icon={v.can_enquire ? MessageCircle : MessageCircleOff}
                      label="Enquire"
                      active={v.can_enquire}
                      disabled={!v.can_view}
                      onClick={() => patch(b.id, 'can_enquire', !v.can_enquire)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 shrink-0 space-y-2">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={pending || brands.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {pending ? 'Saving…' : 'Save Access Permissions'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToggleChip({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border ${
        disabled
          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
          : active
            ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
            : 'bg-danger/5 text-danger border-danger/20 hover:bg-danger/10'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

// ── shared modal shell ────────────────────────────────────────────
function Modal({
  children,
  onClose,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-premium overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-dark">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-dark">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function CredentialBox({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  const loginUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : '/login';
  const text =
    `🔐 *Zoom Mobiles — Your Wholesale Login*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 Email: ${email}\n` +
    `🔑 Password: ${password}\n\n` +
    `🌐 Login here:\n${loginUrl}\n\n` +
    `_Please keep these credentials safe._\n\n` +
    `🙏 Welcome aboard!`;
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 font-mono text-sm">
        <div className="text-slate-500 text-xs">Email</div>
        <div className="font-semibold text-dark">{email}</div>
        <div className="mt-3 text-slate-500 text-xs">Password</div>
        <div className="flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-dark tracking-wider">{password}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-dark hover:bg-slate-50 transition"
      >
        {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy WhatsApp message'}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition"
      >
        Send via WhatsApp
      </a>
    </div>
  );
}

function Input({
  name,
  label,
  defaultValue,
  type = 'text',
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-dark-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
