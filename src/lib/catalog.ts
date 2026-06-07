import { createClient } from '@/lib/supabase/server';
import type { PublicProduct, DbProduct, DbCategory, DbSettings, DbBrand } from '@/lib/supabase/types';

/**
 * Per-customer brand permissions resolved from `customer_brand_access`.
 *  - hidden:    brand_ids the customer must NOT see
 *  - noEnquire: brand_ids the customer can see but cannot enquire
 */
interface BrandAccess {
  hidden: Set<string>;
  noEnquire: Set<string>;
}

/** Returns brand access rules for the currently logged-in customer (admin = no restrictions). */
async function getBrandAccess(): Promise<BrandAccess> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hidden: new Set(), noEnquire: new Set() };

  const { data, error } = await supabase
    .from('customer_brand_access')
    .select('brand_id, can_view, can_enquire')
    .eq('customer_id', user.id);

  if (error) {
    console.error('[getBrandAccess] could not fetch:', error);
    return { hidden: new Set(), noEnquire: new Set() };
  }

  const hidden = new Set<string>();
  const noEnquire = new Set<string>();
  (data ?? []).forEach((r: any) => {
    if (!r.can_view) hidden.add(r.brand_id);
    if (!r.can_enquire) noEnquire.add(r.brand_id);
  });
  return { hidden, noEnquire };
}

/**
 * Strip hidden fields & decorate with can_enquire flag.
 */
function toPublic(
  p: DbProduct & {
    categories?: { slug: string; name: string } | null;
    brands?: { slug: string; name: string } | null;
  },
  noEnquire: Set<string>,
): PublicProduct {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    category_id: p.category_id,
    category_slug: p.categories?.slug,
    category_name: p.categories?.name,
    brand: p.brands?.name ?? p.brand,
    brand_id: p.brand_id,
    brand_slug: p.brands?.slug,

    wholesale_price: p.show_price ? p.wholesale_price : null,
    moq: p.show_moq ? p.moq : null,
    box_qty: p.show_box_qty ? p.box_qty : null,
    stock_qty: p.show_stock ? p.stock_qty : null,
    stock_status: p.stock_status,

    image_url: p.image_url,
    gallery: p.gallery ?? [],
    tags: p.tags ?? [],
    is_featured: p.is_featured,
    is_new_launch: p.is_new_launch,
    is_fast_selling: p.is_fast_selling,

    // Customer can enquire UNLESS this brand has can_enquire=false for them.
    can_enquire: !(p.brand_id && noEnquire.has(p.brand_id)),
  };
}

/**
 * Bulletproof brand-access filter — applied in JS after fetch.
 *
 * Behavior:
 *  - Customer has NO restrictions → show everything (including NULL-brand)
 *  - Customer HAS restrictions → strict allow-list mode:
 *      • Products with brand_id in `hidden` → removed
 *      • Products with NULL brand_id → also removed
 *        (admin should categorize properly; restricted customers must not
 *         see uncategorized items as a back-door)
 */
function applyBrandFilter<T extends { brand_id: string | null }>(
  rows: T[],
  hidden: Set<string>,
): T[] {
  if (hidden.size === 0) return rows;
  return rows.filter((p) => p.brand_id !== null && !hidden.has(p.brand_id));
}

export async function fetchAllProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient();
  const access = await getBrandAccess();

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(slug, name), brands(slug, name)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchAllProducts] supabase error:', error);
    return [];
  }

  const filtered = applyBrandFilter((data ?? []) as any[], access.hidden);
  return filtered.map((p) => toPublic(p as any, access.noEnquire));
}

export async function fetchProductsByCategory(slug: string): Promise<PublicProduct[]> {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from('categories').select('id').eq('slug', slug).maybeSingle();
  if (!cat) return [];

  const access = await getBrandAccess();

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(slug, name), brands(slug, name)')
    .eq('is_published', true)
    .eq('category_id', cat.id)
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchProductsByCategory] supabase error:', error);
    return [];
  }

  const filtered = applyBrandFilter((data ?? []) as any[], access.hidden);
  return filtered.map((p) => toPublic(p as any, access.noEnquire));
}

export async function fetchAllCategories(): Promise<DbCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  return (data ?? []) as DbCategory[];
}

export async function fetchCategoryBySlug(slug: string): Promise<DbCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories').select('*').eq('slug', slug).maybeSingle();
  return (data as DbCategory) ?? null;
}

/** Brands the logged-in customer is allowed to see — used in catalog filter chips. */
export async function fetchVisibleBrands(): Promise<DbBrand[]> {
  const supabase = await createClient();
  const access = await getBrandAccess();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) {
    console.error('[fetchVisibleBrands] supabase error:', error);
    return [];
  }
  // Filter restricted brands in JS
  const filtered = (data ?? []).filter((b: any) => !access.hidden.has(b.id));
  return filtered as DbBrand[];
}

export async function fetchSettings(): Promise<DbSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('settings').select('*').eq('id', 1).maybeSingle();
  return (data as DbSettings) ?? {
    id: 1,
    whatsapp_number: '919207908718',
    whatsapp_display: '+91 92079 08718',
    company_name: 'Zoom Mobiles',
    tagline: 'A Complete Mobile Accessories Hub',
    email: 'sales@zoommobiles.in',
    phone: '+91 92079 08718',
    address: 'India',
    updated_at: new Date().toISOString(),
  };
}

export async function fetchCurrentCustomer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('customers')
    .select('id, full_name, company_name, phone, email, city, is_active')
    .eq('id', user.id)
    .maybeSingle();
  return data ?? null;
}
