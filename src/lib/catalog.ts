import { cache } from 'react';
import { createClient, createServiceClient } from '@/lib/supabase/server';
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

export const fetchAllCategories = cache(async function fetchAllCategories(): Promise<DbCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  return (data ?? []) as DbCategory[];
});

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

/** Active home-page banners (newest config). */
export async function fetchBanners() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return []; // table may not exist yet (pre-migration) → no banners
  return data ?? [];
}

/**
 * Categories that have at least one product the current customer can see.
 * Respects brand access: a category with only restricted-brand products is hidden.
 */
export async function fetchVisibleCategoriesWithCounts(): Promise<
  Array<DbCategory & { product_count: number }>
> {
  const products = await fetchAllProducts(); // already brand-access filtered
  const counts = new Map<string, number>();
  products.forEach((p) => {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  });
  const cats = await fetchAllCategories();
  return cats
    .map((c) => ({ ...c, product_count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.product_count > 0); // hide empty/inaccessible categories
}

// React `cache()` dedupes calls within a single render — if multiple
// server components call fetchSettings(), only one Supabase round-trip happens.
export const fetchSettings = cache(async function fetchSettings(): Promise<DbSettings> {
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
});

export const fetchCurrentCustomer = cache(async function fetchCurrentCustomer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('customers')
    .select('id, full_name, company_name, phone, email, city, is_active')
    .eq('id', user.id)
    .maybeSingle();
  return data ?? null;
});

/**
 * Resolve which WhatsApp number a logged-in customer's enquiries should go to:
 * the admin who created them (customers.created_by → admin_users.whatsapp_number).
 * Returns null for anonymous users, admins, or when the owning admin has no number
 * — callers then fall back to the global settings number.
 *
 * Uses the service-role client to read admin_users because RLS blocks customers
 * from reading admin rows. Server-side only; reads just the WhatsApp fields.
 */
export const resolveCustomerWhatsApp = cache(async function resolveCustomerWhatsApp(): Promise<
  { whatsapp_number: string; whatsapp_display: string } | null
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Customer can read their own row (RLS: "customers self read") → get created_by
  const { data: customer } = await supabase
    .from('customers')
    .select('created_by')
    .eq('id', user.id)
    .maybeSingle();
  if (!customer?.created_by) return null;

  // Owning admin's WhatsApp — via service role (customers can't read admin_users)
  let svc;
  try {
    svc = createServiceClient();
  } catch {
    return null; // service key not configured → fall back to global number
  }

  // Resilient select: try the full set, fall back to base columns if the
  // whatsapp columns don't exist yet (pre-migration). `select('*')` never
  // errors on missing columns, so routing works on any schema state.
  const { data: admin } = await svc
    .from('admin_users')
    .select('*')
    .eq('id', customer.created_by)
    .maybeSingle();

  if (!admin || admin.is_active === false) return null;

  // Priority: explicit WhatsApp number → admin's phone (common: same number).
  const number: string | null =
    (admin.whatsapp_number as string) || (admin.phone as string) || null;

  if (number) {
    const display =
      (admin.whatsapp_display as string) ||
      (admin.whatsapp_number as string) ||
      (admin.phone as string) ||
      number;
    return { whatsapp_number: number, whatsapp_display: display };
  }
  return null;
});
