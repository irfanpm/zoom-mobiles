'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Edit2, Trash2, Eye, EyeOff, Package2 } from 'lucide-react';
import { deleteProduct, toggleProductField } from '@/lib/products/actions';
import { cn } from '@/lib/utils';

type Row = {
  id: string;
  code: string;
  name: string;
  image_url: string | null;
  wholesale_price: number | null;
  stock_qty: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_published: boolean;
  show_price: boolean;
  categories: { name: string } | null;
  brands: { name: string } | null;
};

const STOCK_LABEL = {
  in_stock: { text: 'In Stock', color: 'bg-success/10 text-success border-success/20' },
  low_stock: { text: 'Low', color: 'bg-warning/10 text-warning border-warning/20' },
  out_of_stock: { text: 'Out', color: 'bg-danger/10 text-danger border-danger/20' },
};

export default function ProductsTable({ products }: { products: Row[] }) {
  const [pending, start] = useTransition();
  const [items, setItems] = useState(products);

  function patch(id: string, patch: Partial<Row>) {
    setItems((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function onTogglePublished(r: Row) {
    const newVal = !r.is_published;
    patch(r.id, { is_published: newVal });
    start(() => toggleProductField(r.id, 'is_published', newVal).then((res) => {
      if (res?.error) {
        patch(r.id, { is_published: !newVal });
        alert(res.error);
      }
    }));
  }

  function onTogglePrice(r: Row) {
    const newVal = !r.show_price;
    patch(r.id, { show_price: newVal });
    start(() => toggleProductField(r.id, 'show_price', newVal).then((res) => {
      if (res?.error) {
        patch(r.id, { show_price: !newVal });
        alert(res.error);
      }
    }));
  }

  function onDelete(r: Row) {
    if (!confirm(`Delete "${r.name}" (${r.code})?`)) return;
    start(async () => {
      const res = await deleteProduct(r.id);
      if (res?.error) alert(res.error);
      else setItems((p) => p.filter((x) => x.id !== r.id));
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
        <Package2 className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-3 font-semibold text-dark">No products yet</h3>
        <p className="text-sm text-slate-500 mt-1">Add your first product to get started.</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Add Product
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left font-medium px-4 py-3">Product</th>
              <th className="text-left font-medium px-4 py-3">Category</th>
              <th className="text-left font-medium px-4 py-3">Brand</th>
              <th className="text-right font-medium px-4 py-3">Price</th>
              <th className="text-center font-medium px-4 py-3">Stock</th>
              <th className="text-center font-medium px-4 py-3">Published</th>
              <th className="text-center font-medium px-4 py-3">Show Price</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => {
              const s = STOCK_LABEL[r.stock_status];
              return (
                <tr key={r.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 h-10 w-10 rounded-lg bg-slate-100 overflow-hidden grid place-items-center">
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image_url} alt={r.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package2 className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-dark truncate">{r.name}</div>
                        <div className="text-xs text-slate-500">{r.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.categories?.name ?? <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.brands?.name ?? <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.wholesale_price ? `₹${r.wholesale_price}` : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase', s.color)}>
                      {s.text} {r.stock_qty > 0 && `· ${r.stock_qty}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onTogglePublished(r)}
                      disabled={pending}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition',
                        r.is_published ? 'bg-primary' : 'bg-slate-300',
                      )}
                      aria-label="Toggle published"
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white shadow transition',
                          r.is_published ? 'translate-x-4' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onTogglePrice(r)}
                      disabled={pending}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition',
                        r.show_price
                          ? 'border-primary/20 bg-primary/5 text-primary'
                          : 'border-slate-200 bg-slate-50 text-slate-500',
                      )}
                    >
                      {r.show_price ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {r.show_price ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/products/${r.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => onDelete(r)}
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
    </div>
  );
}
