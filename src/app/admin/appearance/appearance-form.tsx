'use client';

import { useRef, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import {
  ImageIcon, FileText, Save, AlertCircle, CheckCircle2,
  Upload, X, Loader2,
} from 'lucide-react';
import { saveBranding, uploadLogo } from '@/lib/branding/actions';

type Settings = {
  company_name: string;
  tagline: string;
  logo_url: string | null;
  about_title: string | null;
  about_content: string | null;
};

// Current default content — used to pre-fill fields when nothing is saved yet,
// so the admin sees the live values instead of empty boxes.
const DEFAULTS = {
  company_name: 'Zoom Mobiles',
  tagline: 'A Complete Mobile Accessories Hub',
  about_title: "India's most trusted mobile accessories wholesale platform.",
  about_content:
    'We supply 10,000+ retail mobile shops across India with original and compatible accessories — from power banks and TWS to chargers and replacement batteries. Every product, every brand, every model — all under one roof.',
};

export default function AppearanceForm({ settings }: { settings: Settings }) {
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? '');
  const [logoBusy, setLogoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadLogo(fd);
    setLogoBusy(false);
    if (res.error) setError(res.error);
    else if (res.url) setLogoUrl(res.url);
    if (fileRef.current) fileRef.current.value = '';
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    fd.set('logo_url', logoUrl);
    start(async () => {
      const res = await saveBranding(fd);
      if (res?.error) setError(res.error);
      else {
        setSuccess(true);
        if ('warning' in res && res.warning) setWarning(res.warning as string);
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-2 gap-6">
      {/* LOGO + IDENTITY */}
      <Card title="Logo & Identity" icon={ImageIcon}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-dark-700 mb-1.5 block">Company Logo</label>
            {logoUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-6 grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" className="h-20 object-contain" />
                <button type="button" onClick={() => setLogoUrl('')}
                  className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-dark shadow-card hover:bg-danger hover:text-white transition"
                  aria-label="Remove logo">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={logoBusy}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition disabled:opacity-60">
                {logoBusy ? (
                  <><Loader2 className="h-6 w-6 animate-spin" /><span className="text-sm font-medium">Uploading…</span></>
                ) : (
                  <><Upload className="h-6 w-6" /><span className="text-sm font-medium">Upload logo</span>
                    <span className="text-[11px] text-slate-400">PNG / SVG / WebP recommended</span></>
                )}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.svg" className="hidden" onChange={onPickLogo} />
          </div>

          <Field label="Company Name *">
            <input name="company_name" required
              defaultValue={settings.company_name || DEFAULTS.company_name}
              className="input" suppressHydrationWarning />
          </Field>
          <Field label="Tagline">
            <input name="tagline"
              defaultValue={settings.tagline || DEFAULTS.tagline}
              className="input" suppressHydrationWarning />
          </Field>
        </div>
      </Card>

      {/* ABOUT PAGE CONTENT */}
      <Card title="About Page Content" icon={FileText}>
        <div className="space-y-4">
          <Field label="About Title">
            <input name="about_title"
              defaultValue={settings.about_title || DEFAULTS.about_title}
              className="input" suppressHydrationWarning />
          </Field>
          <Field label="About Content">
            <textarea name="about_content" rows={6}
              defaultValue={settings.about_content || DEFAULTS.about_content}
              className="input resize-y" suppressHydrationWarning />
          </Field>
        </div>
      </Card>

      {/* SAVE */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60">
            <Save className="h-4 w-4" />
            {pending ? 'Saving…' : 'Save Appearance'}
          </button>
          {error && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger">
              <AlertCircle className="h-4 w-4" /><span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 rounded-xl bg-success/5 border border-success/20 px-3 py-2.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /><span>Saved! Refresh customer pages to see changes.</span>
            </motion.div>
          )}
        </div>
        {warning && (
          <div className="flex items-start gap-2 rounded-xl bg-warning/5 border border-warning/30 px-3 py-2.5 text-sm text-warning-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
            <span className="text-dark-700">{warning}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%; border-radius: 0.75rem; border: 1px solid rgb(226 232 240);
          padding: 0.625rem 0.875rem; font-size: 0.875rem; outline: none;
          transition: all 0.15s; background: white;
        }
        :global(.input:focus) {
          border-color: rgb(0 200 83); box-shadow: 0 0 0 3px rgba(0,200,83,0.15);
        }
      `}</style>
    </form>
  );
}

function Card({ title, icon: Icon, children, className = '' }: {
  title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden h-fit ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-dark text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-dark-700">{label}</label>
      {children}
    </div>
  );
}
