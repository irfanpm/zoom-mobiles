import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'New Product — Admin' };
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  const supabase = createServiceClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, name').order('sort_order'),
    supabase.from('brands').select('id, name').eq('is_active', true).order('sort_order'),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-dark transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark">New Product</h1>
        <p className="text-sm text-slate-500 mt-1">Add a product to your catalog</p>
      </div>
      <ProductForm categories={categories ?? []} brands={brands ?? []} />
    </div>
  );
}
