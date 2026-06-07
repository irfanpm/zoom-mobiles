'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Building, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { saveSettings } from '@/lib/settings/actions';
import type { DbSettings } from '@/lib/supabase/types';

export default function SettingsForm({ settings }: { settings: DbSettings }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveSettings(fd);
      if (res?.error) setError(res.error);
      else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-2 gap-6">
      <Card title="WhatsApp Settings" icon={MessageCircle} accent="primary">
        <p className="text-xs text-slate-500 mb-4 -mt-1">
          This number receives all customer enquiries.
        </p>
        <Field label="WhatsApp Number (with country code, no +) *" required>
          <input
            name="whatsapp_number"
            required
            defaultValue={settings?.whatsapp_number}
            placeholder="919207908718"
            className="input font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Format: country code + number, digits only.<br />
            Example: <code className="bg-slate-100 px-1 rounded">919207908718</code> for +91 92079 08718
          </p>
        </Field>
        <Field label="Display Format" className="mt-3">
          <input
            name="whatsapp_display"
            defaultValue={settings?.whatsapp_display}
            placeholder="+91 92079 08718"
            className="input"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            How it appears in header, footer & contact pages.
          </p>
        </Field>
      </Card>

      <Card title="Company Information" icon={Building} accent="secondary">
        <Field label="Company Name *" required>
          <input
            name="company_name"
            required
            defaultValue={settings?.company_name}
            className="input"
          />
        </Field>
        <Field label="Tagline" className="mt-3">
          <input
            name="tagline"
            defaultValue={settings?.tagline}
            placeholder="A Complete Mobile Accessories Hub"
            className="input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Email">
            <input
              name="email"
              type="email"
              defaultValue={settings?.email ?? ''}
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              defaultValue={settings?.phone ?? ''}
              className="input"
            />
          </Field>
        </div>
        <Field label="Address" className="mt-3">
          <input
            name="address"
            defaultValue={settings?.address ?? ''}
            className="input"
          />
        </Field>
      </Card>

      <div className="lg:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {pending ? 'Saving…' : 'Save Settings'}
        </button>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-xl bg-success/5 border border-success/20 px-3 py-2.5 text-sm text-success"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings saved!</span>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.15s;
          background: white;
        }
        :global(.input:focus) {
          border-color: rgb(0 200 83);
          box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.15);
        }
      `}</style>
    </form>
  );
}

function Card({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden h-fit">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        <Icon className={accent === 'primary' ? 'h-4 w-4 text-primary' : 'h-4 w-4 text-secondary'} />
        <h2 className="font-semibold text-dark text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-medium text-dark-700">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
