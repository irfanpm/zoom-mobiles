'use client';

import { useRef, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, Upload, Loader2, AlertCircle,
  GalleryHorizontalEnd, ImageIcon,
} from 'lucide-react';
import { saveBanner, deleteBanner, uploadBannerImage } from '@/lib/banners/actions';

type Banner = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type Opt = { slug: string; name: string };

export default function BannersManager({
  banners, categories, brands,
}: {
  banners: Banner[];
  categories: Opt[];
  brands: Opt[];
}) {
  const [items, setItems] = useState(banners);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [pending, start] = useTransition();

  function onDelete(b: Banner) {
    if (!confirm('Delete this banner?')) return;
    start(async () => {
      const res = await deleteBanner(b.id);
      if (res?.error) alert(res.error);
      else setItems((p) => p.filter((x) => x.id !== b.id));
    });
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="font-semibold text-dark text-sm">All Banners</h2>
          <button
            onClick={() => setEditing({ is_active: true, sort_order: items.length })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-600 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Banner
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <GalleryHorizontalEnd className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            No banners yet. Add one — it appears in the home page slider.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((b) => (
              <li key={b.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition">
                <div className="h-16 w-28 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image_url} alt={b.title ?? 'banner'} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark text-sm truncate">{b.title || '(no title)'}</div>
                  <div className="text-xs text-slate-500 truncate">{b.subtitle}</div>
                  {b.link_url && <div className="text-[11px] text-secondary truncate">→ {b.link_url}</div>}
                </div>
                {!b.is_active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Hidden</span>
                )}
                <div className="inline-flex items-center gap-1">
                  <button onClick={() => setEditing(b)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(b)} disabled={pending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-danger/5 hover:text-danger hover:border-danger/20 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <BannerModal
            banner={editing}
            categories={categories}
            brands={brands}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); window.location.reload(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function BannerModal({
  banner, categories, brands, onClose, onSaved,
}: {
  banner: Partial<Banner>;
  categories: Opt[];
  brands: Opt[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(banner.image_url ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadBannerImage(fd);
    setBusy(false);
    if (res.error) setError(res.error);
    else if (res.url) setImageUrl(res.url);
    if (fileRef.current) fileRef.current.value = '';
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!imageUrl) { setError('Please upload a banner image first.'); return; }
    const fd = new FormData(e.currentTarget);
    fd.set('image_url', imageUrl);
    start(async () => {
      const res = await saveBanner(fd);
      if (res?.error) setError(res.error);
      else onSaved();
    });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/40 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white shadow-premium overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-dark flex items-center gap-2">
            <GalleryHorizontalEnd className="h-4 w-4 text-primary" />
            {banner.id ? 'Edit Banner' : 'New Banner'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-dark"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {banner.id && <input type="hidden" name="id" value={banner.id} />}

          {/* Image upload */}
          <div>
            <label className="text-xs font-medium text-dark-700 mb-1.5 block">Banner Image *</label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="w-full h-40 object-cover" />
                <button type="button" onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-dark shadow-card hover:bg-danger hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition disabled:opacity-60">
                {busy ? <><Loader2 className="h-6 w-6 animate-spin" /><span className="text-sm">Uploading…</span></>
                  : <><Upload className="h-6 w-6" /><span className="text-sm font-medium">Upload banner</span>
                      <span className="text-[11px] text-slate-400">Wide image recommended (e.g. 1600×500)</span></>}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </div>

          <Input name="title" label="Title (optional)" defaultValue={banner.title ?? ''} placeholder="SALE UP TO 40% OFF" />
          <Input name="subtitle" label="Subtitle (optional)" defaultValue={banner.subtitle ?? ''} placeholder="New collection — power banks & TWS" />

          <div>
            <label className="text-xs font-medium text-dark-700 mb-1.5 block">Links to (optional)</label>
            <select name="link_url" defaultValue={banner.link_url ?? ''} className="input">
              <option value="">— No link —</option>
              <optgroup label="Categories">
                {categories.map((c) => (
                  <option key={`c-${c.slug}`} value={`/categories/${c.slug}`}>Category: {c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Brands">
                {brands.map((b) => (
                  <option key={`b-${b.slug}`} value={`/products?brand=${b.slug}`}>Brand: {b.name}</option>
                ))}
              </optgroup>
              <option value="/products">All Products</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Where the banner takes the customer when clicked.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input name="sort_order" label="Sort order" type="number" defaultValue={String(banner.sort_order ?? 0)} />
            <label className="flex items-center justify-between py-2 mt-5 cursor-pointer">
              <span className="text-sm text-dark-700">Active</span>
              <span className="relative">
                <input type="checkbox" name="is_active" defaultChecked={banner.is_active !== false} className="peer sr-only" />
                <span className="block h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
              </span>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
              <ImageIcon className="hidden" />
            </div>
          )}

          <button type="submit" disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60">
            <Save className="h-4 w-4" />{pending ? 'Saving…' : 'Save Banner'}
          </button>
        </form>
      </motion.div>

      <style jsx>{`
        :global(.input) {
          width: 100%; border-radius: 0.75rem; border: 1px solid rgb(226 232 240);
          padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; background: white;
        }
        :global(.input:focus) { border-color: rgb(0 200 83); box-shadow: 0 0 0 3px rgba(0,200,83,0.15); }
      `}</style>
    </motion.div>
  );
}

function Input({ name, label, defaultValue, type = 'text', placeholder }: {
  name: string; label: string; defaultValue?: string; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-dark-700">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder}
        className="input" suppressHydrationWarning />
    </div>
  );
}
