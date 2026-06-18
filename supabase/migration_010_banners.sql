-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 010 — HOME PAGE BANNERS
-- ════════════════════════════════════════════════════════════════════
-- Admin-uploadable banners shown on the customer home page.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  title       text,
  subtitle    text,
  link_url    text,           -- e.g. /categories/power-bank or /products?brand=samsung
  sort_order  int  default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create index if not exists banners_sort_idx on public.banners(sort_order);
create index if not exists banners_active_idx on public.banners(is_active);

-- ── RLS ───────────────────────────────────────────────────────────
alter table public.banners enable row level security;

drop policy if exists "banners read for logged-in" on public.banners;
create policy "banners read for logged-in" on public.banners
  for select using (auth.uid() is not null);

drop policy if exists "banners all for admin" on public.banners;
create policy "banners all for admin" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';

select count(*) as banners from public.banners;
