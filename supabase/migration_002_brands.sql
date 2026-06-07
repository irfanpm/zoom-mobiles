-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 002 — BRANDS + PER-CUSTOMER BRAND ACCESS
-- ════════════════════════════════════════════════════════════════════
-- Run this AFTER schema.sql (the first migration).
-- Paste into Supabase Dashboard → SQL Editor → Run.
-- Safe to re-run (idempotent).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. BRANDS TABLE ──────────────────────────────────────────────
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  logo_url    text,
  description text,
  sort_order  int  default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create index if not exists brands_sort_idx on public.brands(sort_order);
create index if not exists brands_active_idx on public.brands(is_active);

-- ── 2. ADD brand_id TO products (keeps existing `brand` text column) ──
alter table public.products
  add column if not exists brand_id uuid references public.brands(id) on delete set null;

create index if not exists products_brand_idx on public.products(brand_id);

-- ── 3. CUSTOMER ↔ BRAND ACCESS TABLE ─────────────────────────────
-- Default behaviour: if NO row exists for (customer, brand), customer can
-- both view AND enquire about that brand. Admins only insert rows when they
-- want to RESTRICT something — so storage stays tiny.
create table if not exists public.customer_brand_access (
  customer_id  uuid not null references public.customers(id) on delete cascade,
  brand_id     uuid not null references public.brands(id) on delete cascade,
  can_view     boolean not null default true,
  can_enquire  boolean not null default true,
  updated_at   timestamptz default now(),
  primary key (customer_id, brand_id)
);

create index if not exists cba_customer_idx on public.customer_brand_access(customer_id);
create index if not exists cba_brand_idx on public.customer_brand_access(brand_id);

-- ── 4. RLS ───────────────────────────────────────────────────────
alter table public.brands enable row level security;
alter table public.customer_brand_access enable row level security;

-- brands: any logged-in user can read; only admins can write
drop policy if exists "brands read for logged-in" on public.brands;
create policy "brands read for logged-in" on public.brands
  for select using (auth.uid() is not null);

drop policy if exists "brands all for admin" on public.brands;
create policy "brands all for admin" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

-- customer_brand_access: customer can read OWN rows; admin can read/write all
drop policy if exists "cba customer self read" on public.customer_brand_access;
create policy "cba customer self read" on public.customer_brand_access
  for select using (auth.uid() = customer_id);

drop policy if exists "cba admin all" on public.customer_brand_access;
create policy "cba admin all" on public.customer_brand_access
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 5. SEED BRANDS ───────────────────────────────────────────────
insert into public.brands (slug, name, sort_order) values
  ('samsung',   'Samsung',     1),
  ('realme',    'Realme',      2),
  ('oppo',      'Oppo',        3),
  ('vivo',      'Vivo',        4),
  ('xiaomi',    'Xiaomi',      5),
  ('redmi',     'Redmi',       6),
  ('iphone',    'iPhone',      7),
  ('oneplus',   'OnePlus',     8),
  ('infinix',   'Infinix',     9),
  ('tecno',     'Tecno',      10),
  ('nokia',     'Nokia',      11),
  ('motorola',  'Motorola',   12),
  ('lava',      'Lava',       13),
  ('itel',      'iTel',       14),
  ('generic',   'Generic',    99)
on conflict (slug) do nothing;

-- ── 6. (Optional) auto-link existing products to brands by name match ──
update public.products p
   set brand_id = b.id
  from public.brands b
 where p.brand_id is null
   and p.brand is not null
   and lower(trim(p.brand)) = lower(b.name);
