'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  IndianRupee,
  Boxes,
  Package,
  Eye,
  Sparkles,
  Save,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { saveProduct } from '@/lib/products/actions';
import ImageUploader from './ImageUploader';
import type { DbProduct } from '@/lib/supabase/types';

type CategoryOpt = { id: string; name: string };
type BrandOpt = { id: string; name: string };

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: DbProduct;
  categories: CategoryOpt[];
  brands: BrandOpt[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveProduct(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {/* MAIN */}
      <div className="lg:col-span-2 space-y-6">
        <Card title="Basic Info" icon={Tag}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product Code *" required>
              <input
                name="code"
                required
                defaultValue={product?.code ?? ''}
                placeholder="PB BLP797"
                className="input"
              />
            </Field>
            <Field label="Brand">
              <select
                name="brand_id"
                defaultValue={product?.brand_id ?? ''}
                className="input"
              >
                <option value="">— Select brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {brands.length === 0 && (
                <p className="text-[11px] text-warning mt-1">
                  ⚠️ No brands yet — <a href="/admin/brands" className="underline font-semibold">add brands first</a>.
                </p>
              )}
            </Field>
            <Field label="Product Name *" required className="sm:col-span-2">
              <input
                name="name"
                required
                defaultValue={product?.name ?? ''}
                placeholder="Power Bank 10000mAh BLP797"
                className="input"
              />
            </Field>
            <Field label="Category" className="sm:col-span-2">
              <select
                name="category_id"
                defaultValue={product?.category_id ?? ''}
                className="input"
              >
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea
                name="description"
                defaultValue={product?.description ?? ''}
                rows={3}
                placeholder="Short description for customers"
                className="input resize-none"
              />
            </Field>
            <Field label="Tags (comma-separated)" className="sm:col-span-2">
              <input
                name="tags"
                defaultValue={(product?.tags ?? []).join(', ')}
                placeholder="bestseller, fast-charging, type-c"
                className="input"
              />
            </Field>
          </div>
        </Card>

        <Card title="Pricing & Inventory" icon={IndianRupee}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Wholesale Price (₹)">
              <input
                name="wholesale_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.wholesale_price ?? ''}
                placeholder="450"
                className="input"
              />
            </Field>
            <Field label="Stock Status">
              <select
                name="stock_status"
                defaultValue={product?.stock_status ?? 'in_stock'}
                className="input"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </Field>
            <Field label="MOQ (Minimum Order Qty)">
              <input
                name="moq"
                type="number"
                min="1"
                defaultValue={product?.moq ?? 1}
                className="input"
              />
            </Field>
            <Field label="Box Quantity (pcs/box)">
              <input
                name="box_qty"
                type="number"
                min="1"
                defaultValue={product?.box_qty ?? 100}
                className="input"
              />
            </Field>
            <Field label="Stock Quantity (boxes available)" className="sm:col-span-2">
              <input
                name="stock_qty"
                type="number"
                min="0"
                defaultValue={product?.stock_qty ?? 10}
                className="input"
              />
            </Field>
          </div>
        </Card>

        <Card title="Images" icon={Layers}>
          <ImageUploader
            name="image_url"
            label="Main Image"
            defaultValue={product?.image_url}
          />
          <Field label="Gallery (additional image URLs, comma-separated)" className="mt-4">
            <input
              name="gallery"
              defaultValue={(product?.gallery ?? []).join(', ')}
              placeholder="https://…/img2.jpg, https://…/img3.jpg"
              className="input"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Upload extras manually for now or add URLs here.
            </p>
          </Field>
        </Card>
      </div>

      {/* SIDEBAR */}
      <div className="space-y-6">
        <Card title="Visibility Toggles" icon={Eye}>
          <p className="text-xs text-slate-500 mb-4 -mt-1">
            Control what each customer sees for this product.
          </p>
          <Toggle name="is_published" label="Published in catalog" defaultChecked={product?.is_published ?? true} />
          <Toggle name="show_price" label="Show price to customer" defaultChecked={product?.show_price ?? true} />
          <Toggle name="show_stock" label="Show stock quantity" defaultChecked={product?.show_stock ?? true} />
          <Toggle name="show_moq" label="Show MOQ" defaultChecked={product?.show_moq ?? true} />
          <Toggle name="show_box_qty" label="Show box quantity" defaultChecked={product?.show_box_qty ?? true} />
        </Card>

        <Card title="Highlights" icon={Sparkles}>
          <Toggle name="is_featured" label="Featured" defaultChecked={product?.is_featured ?? false} />
          <Toggle name="is_new_launch" label="New Launch badge" defaultChecked={product?.is_new_launch ?? false} />
          <Toggle name="is_fast_selling" label="Fast Selling badge" defaultChecked={product?.is_fast_selling ?? false} />
        </Card>

        <Card title="Display Order" icon={Boxes}>
          <Field label="Sort Order (lower = first)">
            <input
              name="sort_order"
              type="number"
              defaultValue={product?.sort_order ?? 0}
              className="input"
            />
          </Field>
        </Card>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-600 transition disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {pending ? 'Saving…' : product?.id ? 'Save Changes' : 'Create Product'}
        </button>
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
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        <Icon className="h-4 w-4 text-primary" />
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

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer group">
      <span className="text-sm text-dark-700 group-hover:text-dark transition">{label}</span>
      <span className="relative">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="block h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-primary" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
