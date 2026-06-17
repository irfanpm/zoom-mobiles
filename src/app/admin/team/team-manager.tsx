'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, KeyRound, Copy, CheckCircle2,
  AlertCircle, Crown, ShieldCheck, UserRound, Phone,
} from 'lucide-react';
import { createAdmin, updateAdmin, deleteAdmin } from '@/lib/team/actions';
import { PERMISSION_DEFS, DEFAULT_PERMISSIONS, type AdminPermissions } from '@/lib/permissions';

type AdminRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_display: string | null;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  permissions: AdminPermissions | null;
  created_at: string;
};

export default function TeamManager({ admins, myId }: { admins: AdminRow[]; myId: string }) {
  const [items, setItems] = useState(admins);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createAdmin(fd);
      if (res?.error) { setError(res.error); return; }
      if (res?.credentials) {
        setCredentials(res.credentials);
        setCreating(false);
        window.location.reload();
      }
    });
  }

  function onDelete(a: AdminRow) {
    if (a.id === myId) return;
    if (!confirm(`Delete admin "${a.full_name}"? Their customers will be re-assigned to you.`)) return;
    start(async () => {
      const res = await deleteAdmin(a.id);
      if (res?.error) alert(res.error);
      else setItems((p) => p.filter((x) => x.id !== a.id));
    });
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="font-semibold text-dark text-sm">All Admins</h2>
          <button
            onClick={() => { setCreating(true); setError(null); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-600 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Admin
          </button>
        </div>

        <ul className="divide-y divide-slate-100">
          {items.map((a) => {
            const perms = a.permissions ?? DEFAULT_PERMISSIONS;
            const onCount = PERMISSION_DEFS.filter((p) => perms[p.key] !== false).length;
            const isSuper = a.role === 'super_admin';
            return (
              <li key={a.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition">
                <div className={`shrink-0 grid h-10 w-10 place-items-center rounded-full text-white text-sm font-bold ${
                  isSuper ? 'bg-gradient-to-br from-accent to-amber-600' : 'bg-gradient-to-br from-primary to-secondary'
                }`}>
                  {isSuper ? <Crown className="h-4 w-4" /> : a.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark text-sm flex items-center gap-2 flex-wrap">
                    {a.full_name}
                    {a.id === myId && <span className="text-[10px] text-slate-400">(you)</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      isSuper ? 'bg-accent/15 text-accent-700' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {isSuper ? 'Super Admin' : 'Admin'}
                    </span>
                    {!a.is_active && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="truncate">{a.email}</span>
                    {a.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</span>}
                    {!isSuper && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <ShieldCheck className="h-3 w-3" />
                        {onCount}/{PERMISSION_DEFS.length} permissions
                      </span>
                    )}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(a); setError(null); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    aria-label="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {a.id !== myId && !isSuper && (
                    <button
                      onClick={() => onDelete(a)}
                      disabled={pending}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-danger/5 hover:text-danger hover:border-danger/20 transition"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {creating && (
          <Modal onClose={() => setCreating(false)} title="Add Sub-Admin"
            subtitle="They start with FULL permissions — turn features off after creating if needed.">
            <form onSubmit={onCreate} className="space-y-3">
              <Input name="full_name" label="Full Name *" required />
              <Input name="email" label="Email *" type="email" required />
              <Input name="password" label="Password *" type="text" required placeholder="At least 6 characters" />
              <div className="grid grid-cols-2 gap-3">
                <Input name="phone" label="Phone" />
                <Input name="whatsapp_number" label="WhatsApp (with code)" placeholder="919876543210" />
              </div>
              <p className="text-[11px] text-slate-400 -mt-1">
                📲 This admin&apos;s customers&apos; enquiries will be sent to this WhatsApp number.
              </p>
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={pending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60">
                <Save className="h-4 w-4" />
                {pending ? 'Creating…' : 'Create Admin & Generate Login'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <EditAdminModal
            admin={editing}
            isSelf={editing.id === myId}
            onClose={() => setEditing(null)}
            onSaved={(pw) => {
              if (pw) setCredentials({ email: editing.email ?? '', password: pw });
              setEditing(null);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>

      {/* CREDENTIALS MODAL */}
      <AnimatePresence>
        {credentials && (
          <Modal onClose={() => setCredentials(null)} title="✅ Admin Login Credentials"
            subtitle="Share these privately — shown only once.">
            <CredBox email={credentials.email} password={credentials.password} />
            <button onClick={() => setCredentials(null)}
              className="mt-4 w-full rounded-xl bg-dark px-4 py-3 text-sm font-semibold text-white hover:bg-dark-700 transition">
              Got it
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// ── EDIT MODAL with permission toggles ────────────────────────────
function EditAdminModal({
  admin, isSelf, onClose, onSaved,
}: {
  admin: AdminRow;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (newPassword?: string) => void;
}) {
  const [perms, setPerms] = useState<AdminPermissions>({
    ...DEFAULT_PERMISSIONS,
    ...(admin.permissions ?? {}),
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isSuper = admin.role === 'super_admin';

  const groups = Array.from(new Set(PERMISSION_DEFS.map((p) => p.group)));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('permissions', JSON.stringify(perms));
    start(async () => {
      const res = await updateAdmin(fd);
      if (res?.error) { setError(res.error); return; }
      onSaved(res?.new_password);
    });
  }

  return (
    <Modal onClose={onClose} title={`Edit: ${admin.full_name}`}
      subtitle={isSuper ? 'Super admin — full access always' : 'Toggle what this admin can do'} wide>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={admin.id} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input name="full_name" label="Full Name" defaultValue={admin.full_name} />
          <Input name="phone" label="Phone" defaultValue={admin.phone ?? ''} />
        </div>
        <div className="space-y-1">
          <Input
            name="whatsapp_number"
            label="WhatsApp Number (with country code)"
            defaultValue={admin.whatsapp_number ?? ''}
            placeholder="919876543210"
          />
          <p className="text-[11px] text-slate-400">
            📲 Enquiries from this admin&apos;s customers are sent here.
          </p>
        </div>

        {!isSelf && !isSuper && (
          <>
            <Input name="new_password" label="Reset password (optional)" placeholder="Leave blank to keep current" />

            <label className="flex items-center justify-between py-2 cursor-pointer border-t border-slate-100 pt-3">
              <span className="text-sm text-dark-700 font-medium">Account active</span>
              <Toggle name="is_active" defaultChecked={admin.is_active} />
            </label>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-sm font-semibold text-dark mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-secondary" /> Permissions
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {groups.map((g) => (
                  <div key={g}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{g}</div>
                    {PERMISSION_DEFS.filter((p) => p.group === g).map((p) => (
                      <label key={p.key} className="flex items-center justify-between py-1.5 cursor-pointer">
                        <span className="text-sm text-dark-700">{p.label}</span>
                        <button
                          type="button"
                          onClick={() => setPerms((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                            perms[p.key] ? 'bg-primary' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${
                            perms[p.key] ? 'translate-x-4' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <ErrorBox msg={error} />}
        <button type="submit" disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60">
          <Save className="h-4 w-4" />
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
}

// ── shared bits ───────────────────────────────────────────────────
function Modal({ children, onClose, title, subtitle, wide }: {
  children: React.ReactNode; onClose: () => void; title: string; subtitle?: string; wide?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/40 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-2xl bg-white shadow-premium overflow-hidden max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-start justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-dark flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" /> {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-dark"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function CredBox({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login';
  const text =
    `🔐 *Zoom Mobiles — Admin Login*\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 Email: ${email}\n🔑 Password: ${password}\n\n🌐 Login:\n${loginUrl}\n\n` +
    `_Keep these credentials safe._`;
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
      <button type="button"
        onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-dark hover:bg-slate-50 transition">
        {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy WhatsApp message'}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition">
        Send via WhatsApp
      </a>
    </div>
  );
}

function Toggle({ name, defaultChecked }: { name: string; defaultChecked?: boolean }) {
  return (
    <span className="relative">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="block h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-primary" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
    </span>
  );
}

function Input({ name, label, defaultValue, type = 'text', required, placeholder }: {
  name: string; label: string; defaultValue?: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-dark-700">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder}
        suppressHydrationWarning
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}
