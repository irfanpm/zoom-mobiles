import { redirect } from 'next/navigation';
import { FolderTree } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/auth/admin-guard';
import CategoriesManager from './categories-manager';

export const metadata = { title: 'Categories — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin/login');
  const supabase = createServiceClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-2">
          <FolderTree className="h-7 w-7 text-primary" />
          Categories
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {categories?.length ?? 0} categories · organize your catalog
        </p>
      </div>
      <CategoriesManager categories={(categories ?? []) as any} />
    </div>
  );
}
