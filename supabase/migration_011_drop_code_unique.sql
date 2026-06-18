-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 011 — ALLOW DUPLICATE PRODUCT CODES
-- ════════════════════════════════════════════════════════════════════
-- Removes the UNIQUE constraint on products.code so the same code can be
-- used on multiple (different) products. Keeps a normal index for fast search.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- Drop the auto-named unique constraint (from `code text unique`)
alter table public.products drop constraint if exists products_code_key;

-- Some setups create it as a unique index instead — drop that too if present
drop index if exists products_code_key;

-- Keep a plain (non-unique) index so search-by-code stays fast
create index if not exists products_code_idx on public.products(code);

notify pgrst, 'reload schema';

-- Verify: should return NO rows with contype = 'u' for the code column
select conname, contype
from pg_constraint
where conrelid = 'public.products'::regclass and contype = 'u';
