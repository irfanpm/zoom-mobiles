-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 007 — DELETE PRODUCTS WITHOUT A BRAND
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ DESTRUCTIVE: This permanently removes products where brand_id IS NULL.
--
-- Recommended workflow:
--   1. Run STEP A first — preview what will be deleted
--   2. If list looks right, uncomment STEP B and run again to delete
--   3. Run STEP C to verify the cleanup
--
-- Why? Brandless products clutter the catalog and bypass brand-access
-- restrictions (a restricted customer would see "uncategorized" products
-- even when they shouldn't).
-- ════════════════════════════════════════════════════════════════════

-- ── STEP A: PREVIEW (always safe to run) ─────────────────────────
-- Shows products that would be deleted, with their brand text
select
  code,
  name,
  brand as brand_text,
  category_id,
  created_at,
  '🗑️ will be deleted' as action
from public.products
where brand_id is null
order by brand, code;

-- Count
select
  count(*) as brandless_products_count,
  count(*) filter (where brand is not null) as had_brand_text_but_unmatched,
  count(*) filter (where brand is null) as truly_unbranded
from public.products
where brand_id is null;


-- ── STEP B: DELETE (uncomment lines below to actually delete) ────
-- Remove the `/*` and `*/` lines, then re-run to perform deletion.

/*
delete from public.products
 where brand_id is null;
*/


-- ── STEP C: VERIFY (run after deletion to confirm) ───────────────
select
  count(*) filter (where brand_id is not null) as products_with_brand,
  count(*) filter (where brand_id is null)     as products_without_brand,
  count(*)                                      as total_products
from public.products;
