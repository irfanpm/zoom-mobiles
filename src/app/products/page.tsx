import { fetchAllProducts, fetchAllCategories, fetchCurrentCustomer } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';
import { toUIProduct } from '@/lib/data-mapper';
import ProductsClient from './products-client';

export const metadata = { title: 'Wholesale Catalog — Zoom Mobiles' };
// 10-second cache. Admin product saves call revalidatePath('/products') so
// changes appear within seconds while customer navigation feels instant.
export const revalidate = 10;

export default async function ProductsPage() {
  const [publicProducts, categories, customer] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
    fetchCurrentCustomer(),
  ]);

  const products = publicProducts.map(toUIProduct);

  // ── DIAGNOSTIC: if catalog is empty, gather counts so we can tell the
  //    customer WHY (no products in DB / all restricted / unbranded).
  let diagnostic: {
    totalPublished: number;
    totalBrands: number;
    restrictedBrands: number;
    unbrandedProducts: number;
  } | null = null;

  if (products.length === 0) {
    const supabase = await createClient();
    const [{ count: totalPublished }, { count: totalBrands }, restrictionsRes, unbrandedRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('brands').select('*', { count: 'exact', head: true }).eq('is_active', true),
      customer
        ? supabase.from('customer_brand_access').select('*', { count: 'exact', head: true })
            .eq('customer_id', customer.id).eq('can_view', false)
        : Promise.resolve({ count: 0 }),
      supabase.from('products').select('*', { count: 'exact', head: true })
        .eq('is_published', true).is('brand_id', null),
    ]);
    diagnostic = {
      totalPublished: totalPublished ?? 0,
      totalBrands: totalBrands ?? 0,
      restrictedBrands: restrictionsRes.count ?? 0,
      unbrandedProducts: unbrandedRes.count ?? 0,
    };
  }

  return (
    <ProductsClient
      products={products}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      customerName={customer?.full_name ?? null}
      diagnostic={diagnostic}
    />
  );
}
