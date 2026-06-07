-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 005 — PRODUCT IMAGES (placeholders by category)
-- ════════════════════════════════════════════════════════════════════
-- Sets a clean colour-coded placeholder image for every product that
-- doesn't already have one. Categories share visual themes so the
-- catalog looks polished immediately.
--
-- Replace any individual product's image via:
--   /admin/products → click product → drag-drop a real photo
--
-- Uses placehold.co (free, no key, no rate limit).
-- Safe to re-run — only updates products with NULL/empty image_url.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. POWER BANKS — green theme ─────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/00C853/ffffff?text=Power%20Bank&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'power-bank'
   and (p.image_url is null or p.image_url = '');

-- ── 2. CHARGERS — blue theme ─────────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/0066FF/ffffff?text=Fast%20Charger&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'charger'
   and (p.image_url is null or p.image_url = '');

-- ── 3. CABLES — amber theme ──────────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/FFB800/0F172A?text=Data%20Cable&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'cable'
   and (p.image_url is null or p.image_url = '');

-- ── 4. TWS — dark theme ──────────────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/0F172A/00C853?text=TWS%20Earbuds&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'tws'
   and (p.image_url is null or p.image_url = '');

-- ── 5. NECKBANDS — purple theme ─────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/7C3AED/ffffff?text=Neckband&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'neckband'
   and (p.image_url is null or p.image_url = '');

-- ── 6. SPEAKERS — red theme ─────────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/DC2626/ffffff?text=Bluetooth%20Speaker&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'speaker'
   and (p.image_url is null or p.image_url = '');

-- ── 7. SMART WATCHES — teal theme ───────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/0D9488/ffffff?text=Smart%20Watch&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'smart-watch'
   and (p.image_url is null or p.image_url = '');

-- ── 8. HANDSFREE — pink theme ───────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/DB2777/ffffff?text=Wired%20Handsfree&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'handsfree'
   and (p.image_url is null or p.image_url = '');

-- ── 9. ADAPTERS — slate theme ───────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/475569/ffffff?text=Adapter&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'adapter'
   and (p.image_url is null or p.image_url = '');

-- ── 10. BATTERIES — orange theme ────────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/EA580C/ffffff?text=Mobile%20Battery&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'battery'
   and (p.image_url is null or p.image_url = '');

-- ── 11. ACCESSORIES — indigo theme ──────────────────────────────
update public.products p
   set image_url = 'https://placehold.co/600x600/4F46E5/ffffff?text=Accessory&font=montserrat'
  from public.categories c
 where p.category_id = c.id
   and c.slug = 'accessory'
   and (p.image_url is null or p.image_url = '');

-- ── Final fallback for any uncategorized product ────────────────
update public.products
   set image_url = 'https://placehold.co/600x600/0F172A/00C853?text=Product&font=montserrat'
 where image_url is null or image_url = '';

-- ── Verify ──────────────────────────────────────────────────────
select
  c.name as category,
  count(*) as products_with_image
from public.products p
join public.categories c on c.id = p.category_id
where p.image_url is not null and p.image_url != ''
group by c.name
order by c.name;
