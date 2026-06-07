import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'Edit Product — Admin' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: brands }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('id, name').order('sort_order'),
    supabase.from('brands').select('id, name').eq('is_active', true).order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-dark transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark">Edit Product</h1>
        <p className="text-sm text-slate-500 mt-1">{product.code} · {product.name}</p>
      </div>
      <ProductForm product={product as any} categories={categories ?? []} brands={brands ?? []} />
    </div>
  );
}
