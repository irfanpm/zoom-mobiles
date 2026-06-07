-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 006 — REPAIR BRAND LINKS FOR EXISTING PRODUCTS
-- ════════════════════════════════════════════════════════════════════
-- Run this if you see products with NULL brand_id even though they
-- have a brand text value. Possible causes:
--   • migration_003 wasn't run yet (missing accessory brands like boAt, JBL)
--   • Brand text on product doesn't exactly match brands.name
--
-- This migration:
--   1. Adds any missing brands (Step A)
--   2. Re-links products to brands by name (case-insensitive)         (Step B)
--   3. Reports anything still un-linked so you can fix manually        (Step C)
-- Safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- ── STEP A: ensure these brands exist (idempotent) ───────────────
insert into public.brands (slug, name, sort_order) values
  -- Mobile phone brands
  ('samsung', 'Samsung', 1), ('realme', 'Realme', 2),
  ('oppo', 'Oppo', 3), ('vivo', 'Vivo', 4),
  ('xiaomi', 'Xiaomi', 5), ('redmi', 'Redmi', 6),
  ('iphone', 'iPhone', 7), ('oneplus', 'OnePlus', 8),
  ('infinix', 'Infinix', 9), ('tecno', 'Tecno', 10),
  ('nokia', 'Nokia', 11), ('motorola', 'Motorola', 12),
  ('lava', 'Lava', 13), ('itel', 'iTel', 14),
  ('generic', 'Generic', 99),
  -- Audio / TWS
  ('boat', 'boAt', 40), ('jbl', 'JBL', 41),
  ('sony', 'Sony', 42), ('bose', 'Bose', 43),
  ('sennheiser', 'Sennheiser', 44), ('mivi', 'Mivi', 45),
  ('noise', 'Noise', 46), ('boult', 'Boult Audio', 47),
  ('portronics', 'Portronics', 48), ('ptron', 'pTron', 49),
  ('skullcandy', 'Skullcandy', 50), ('marshall', 'Marshall', 51),
  -- Charging
  ('anker', 'Anker', 70), ('belkin', 'Belkin', 71),
  ('ambrane', 'Ambrane', 72), ('mi', 'Mi', 73),
  ('stuffcool', 'Stuffcool', 74), ('syska', 'Syska', 75),
  ('zebronics', 'Zebronics', 78), ('robotek', 'Robotek', 79),
  -- Wearables
  ('fireboltt', 'Fire-Boltt', 100), ('fastrack', 'Fastrack', 101),
  ('amazfit', 'Amazfit', 102),
  -- Cases
  ('spigen', 'Spigen', 120)
on conflict (slug) do nothing;

-- ── STEP B: re-link products to brands by name (case-insensitive) ──
update public.products p
   set brand_id = b.id
  from public.brands b
 where p.brand_id is null
   and p.brand is not null
   and lower(trim(p.brand)) = lower(b.name);

-- Also try matching against brand slug (handles brand_text = "boat" → boAt)
update public.products p
   set brand_id = b.id
  from public.brands b
 where p.brand_id is null
   and p.brand is not null
   and lower(trim(p.brand)) = b.slug;

-- ── STEP C: report anything still unlinked ────────────────────────
select
  code,
  name,
  brand as brand_text_on_product,
  '⚠️ no brand match — edit this product in admin' as action_needed
from public.products
where brand_id is null
  and brand is not null
order by brand, code;

-- ── Summary ──────────────────────────────────────────────────────
select
  count(*) filter (where brand_id is not null) as products_with_brand,
  count(*) filter (where brand_id is null) as products_without_brand,
  count(*) as total
from public.products;
