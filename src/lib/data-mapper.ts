import type { Product, StockStatus as UIStockStatus } from '@/types';
import type { PublicProduct } from '@/lib/supabase/types';

/** Convert DB stock_status (in_stock) → UI StockStatus (in-stock) */
function mapStatus(s: PublicProduct['stock_status']): UIStockStatus {
  if (s === 'in_stock') return 'in-stock';
  if (s === 'low_stock') return 'low-stock';
  return 'out-of-stock';
}

/** Map a PublicProduct (DB shape) to the UI Product shape. */
export function toUIProduct(p: PublicProduct): Product {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    category: p.category_slug ?? 'uncategorized',
    brand: p.brand ?? '—',
    description: p.description ?? '',
    image: p.image_url ?? undefined,
    box: p.box_qty,             // null if hidden
    inner: p.box_qty ? Math.max(1, Math.floor(p.box_qty / 10)) : null,
    availableQty: p.stock_qty,  // null if hidden
    moq: p.moq,                 // null if hidden
    price: p.wholesale_price,   // null if hidden
    status: mapStatus(p.stock_status),
    tags: p.tags,
    isNew: p.is_new_launch,
    isFastSelling: p.is_fast_selling,
    canEnquire: p.can_enquire,
  };
}
