'use client';

import { useRef, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import {
  ImageIcon, Palette, Type, FileText, Save, AlertCircle, CheckCircle2,
  Upload, X, Loader2, RotateCcw,
} from 'lucide-react';
import { saveBranding, uploadLogo } from '@/lib/branding/actions';

type Settings = {
  company_name: string;
  tagline: string;
  logo_url: string | null;
  theme_primary: string | null;
  theme_secondary: string | null;
  theme_accent: string | null;
  about_title: string | null;
  about_content: string | null;
};

const THEME_DEFAULTS = {
  theme_primary: '#00C853',
  theme_secondary: '#0066FF',
  theme_accent: '#FFB800',
};

export default function AppearanceForm({ settings }: { settings: Settings }) {
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? '');
  const [colors, setColors] = useState({
    theme_primary: settings.theme_primary ?? THEME_DEFAULTS.theme_primary,
    theme_secondary: settings.theme_secondary ?? THEME_DEFAULTS.theme_secondary,
    theme_accent: settings.theme_accent ?? THEME_DEFAULTS.theme_accent,
  });
  const [logoBusy, setLogoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    fd.set('logo_url', logoUrl);
    fd.set('theme_primary', colors.theme_primary);
    fd.set('theme_secondary', colors.theme_secondary);
    fd.set('theme_accent', colors.theme_accent);
    start(async () => {
      const res = await saveBranding(fd);
      if (res?.error) setError(res.error);
      else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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
            <input name="company_name" required defaultValue={settings.company_name}
              className="input" suppressHydrationWarning />
          </Field>
          <Field label="Tagline">
            <input name="tagline" defaultValue={settings.tagline}
              placeholder="A Complete Mobile Accessories Hub" className="input" suppressHydrationWarning />
          </Field>
        </div>
      </Card>

      {/* COLOR THEME */}
      <Card title="Color Theme" icon={Palette}>
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          Changes the main brand colors across the whole site (buttons, badges, highlights).
        </p>
        <div className="space-y-4">
          <ColorRow label="Primary (buttons, highlights)" value={colors.theme_primary}
            onChange={(v) => setColors((c) => ({ ...c, theme_primary: v }))} />
          <ColorRow label="Secondary (links, accents)" value={colors.theme_secondary}
            onChange={(v) => setColors((c) => ({ ...c, theme_secondary: v }))} />
          <ColorRow label="Accent (badges, highlights)" value={colors.theme_accent}
            onChange={(v) => setColors((c) => ({ ...c, theme_accent: v }))} />

          <button type="button"
            onClick={() => setColors({ ...THEME_DEFAULTS })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition">
            <RotateCcw className="h-3 w-3" /> Reset to default colors
          </button>

          {/* live preview */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview</div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl px-4 py-2 text-xs font-semibold text-white"
                style={{ background: colors.theme_primary }}>Primary Button</span>
              <span className="rounded-xl px-4 py-2 text-xs font-semibold text-white"
                style={{ background: colors.theme_secondary }}>Secondary</span>
              <span className="rounded-xl px-4 py-2 text-xs font-semibold text-dark"
                style={{ background: colors.theme_accent }}>Accent</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ABOUT PAGE CONTENT */}
      <Card title="About Page Content" icon={FileText} className="lg:col-span-2">
        <div className="space-y-4">
          <Field label="About Title">
            <input name="about_title"
              defaultValue={settings.about_title ?? ''}
              placeholder="India's most trusted mobile accessories wholesale platform."
              className="input" suppressHydrationWarning />
          </Field>
          <Field label="About Content">
            <textarea name="about_content" rows={6}
              defaultValue={settings.about_content ?? ''}
              placeholder="We supply 10,000+ retail mobile shops across India with original and compatible accessories…"
              className="input resize-y" suppressHydrationWarning />
          </Field>
        </div>
      </Card>

      {/* SAVE */}
      <div className="lg:col-span-2 flex items-center gap-3">
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

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer bg-white p-1" />
      <div className="flex-1">
        <div className="text-xs font-medium text-dark-700">{label}</div>
        <input type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-28 rounded-lg border border-slate-200 px-2 py-1 text-xs font-mono outline-none focus:border-primary"
          suppressHydrationWarning />
      </div>
    </div>
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
