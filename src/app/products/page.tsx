import { fetchAllProducts, fetchAllCategories, fetchCurrentCustomer } from '@/lib/catalog';
import { toUIProduct } from '@/lib/data-mapper';
import ProductsClient from './products-client';

export const metadata = { title: 'Wholesale Catalog — Zoom Mobiles' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function ProductsPage() {
  const [publicProducts, categories, customer] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
    fetchCurrentCustomer(),
  ]);

  const products = publicProducts.map(toUIProduct);

  return (
    <ProductsClient
      products={products}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      customerName={customer?.full_name ?? null}
    />
  );
}
