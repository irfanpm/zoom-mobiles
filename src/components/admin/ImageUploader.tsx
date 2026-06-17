'use client';

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { uploadProductImage } from '@/lib/products/actions';
import {
  MAX_IMAGE_MB,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_MIME,
  ALLOWED_IMAGE_EXT_LABEL,
} from '@/lib/config';

export default function ImageUploader({
  name,
  defaultValue,
  label = 'Image',
  className = '',
}: {
  name: string;
  defaultValue?: string | null;
  label?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ── Client-side checks first (saves a network round-trip) ──
    if (file.type && !ALLOWED_IMAGE_MIME.includes(file.type)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_IMAGE_EXT_LABEL}`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      setError(
        `Image is ${sizeMB} MB — must be ≤ ${MAX_IMAGE_MB} MB. ` +
          `Try compressing at tinypng.com or squoosh.app.`,
      );
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (file.size === 0) {
      setError('File appears to be empty.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadProductImage(fd);
    setBusy(false);
    if (res.error) setError(res.error);
    else if (res.url) setUrl(res.url);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className={className}>
      <label className="text-sm font-medium text-dark-700 mb-1.5 block">{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full h-44 object-cover" />
          <button
            type="button"
            onClick={() => setUrl('')}
            className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-dark shadow-card hover:bg-danger hover:text-white transition"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm font-medium">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span className="text-sm font-medium">Click to upload</span>
              <span className="text-[11px] text-slate-400">
                {ALLOWED_IMAGE_EXT_LABEL} · max {MAX_IMAGE_MB} MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED_IMAGE_MIME.join(',')}
        className="hidden"
        onChange={onPick}
      />

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-danger/5 border border-danger/20 px-2.5 py-2 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
          {/* keep ImageIcon imported for accessibility usage */}
          <ImageIcon className="hidden" />
        </div>
      )}
    </div>
  );
}
