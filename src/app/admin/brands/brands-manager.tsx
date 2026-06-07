'use client';

import { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, Tag, Save, X, EyeOff, Eye } from 'lucide-react';
import { saveBrand, deleteBrand } from '@/lib/brands/actions';
import type { DbBrand } from '@/lib/supabase/types';

export default function BrandsManager({ brands }: { brands: DbBrand[] }) {
  const [items, setItems] = useState<DbBrand[]>(brands);
  const [editing, setEditing] = useState<Partial<DbBrand> | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveBrand(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      window.location.reload();
    });
  }

  function onDel(b: DbBrand) {
    if (!confirm(`Delete brand "${b.name}"? Products will be unlinked.`)) return;
    start(async () => {
      const res = await deleteBrand(b.id);
      if (res?.error) alert(res.error);
      else setItems((p) => p.filter((x) => x.id !== b.id));
    });
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-dark text-sm">All Brands</h2>
          <button
            onClick={() => { setEditing({ is_active: true }); setError(null); }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add new
          </button>
        </div>
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            <Tag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            No brands yet. Add one →
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((b) => (
              <li key={b.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary/5 text-secondary overflow-hidden">
                  {b.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo_url} alt={b.name} className="h-full w-full object-cover" />
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-dark text-sm flex items-center gap-2">
                    {b.name}
                    {!b.is_active && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-semibold uppercase">
                        <EyeOff className="h-2.5 w-2.5" /> Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">/{b.slug}</div>
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(b); setError(null); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDel(b)}
                    disabled={pending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-danger/5 hover:text-danger hover:border-danger/20 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white shadow-card border border-slate-200 p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-dark text-sm">
            {editing?.id ? 'Edit Brand' : 'New Brand'}
          </h2>
          {editing && (
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing({ is_active: true })}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition"
          >
            <Plus className="h-4 w-4" /> Add new brand
          </button>
        ) : (
          <form onSubmit={onSave} className="space-y-3">
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <Input name="name" label="Name *" defaultValue={editing.name ?? ''} required placeholder="Samsung" />
            <Input name="slug" label="Slug (URL)" defaultValue={editing.slug ?? ''} placeholder="auto from name" />
            <Input name="logo_url" label="Logo URL" defaultValue={editing.logo_url ?? ''} placeholder="https://…/logo.png" />
            <Input name="description" label="Description" defaultValue={editing.description ?? ''} />
            <Input name="sort_order" label="Sort order" type="number" defaultValue={editing.sort_order ?? 0} />

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm text-dark-700 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Brand is active
              </span>
              <span className="relative">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editing.is_active !== false}
                  className="peer sr-only"
                />
                <span className="block h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
              </span>
            </label>

            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {pending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Input({
  name, label, defaultValue, type = 'text', required, placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
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
