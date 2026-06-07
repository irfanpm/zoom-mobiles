-- ════════════════════════════════════════════════════════════════════
-- ZOOM MOBILES — Database schema
-- ════════════════════════════════════════════════════════════════════
-- Run this in Supabase Dashboard → SQL Editor → "+ New query" → Run.
-- Idempotent: safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 1. CATEGORIES ─────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text default 'Package',
  sort_order  int  default 0,
  created_at  timestamptz default now()
);

create index if not exists categories_sort_idx on public.categories(sort_order);

-- ── 2. PRODUCTS ───────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  name            text not null,
  description     text,
  category_id     uuid references public.categories(id) on delete set null,
  brand           text,

  wholesale_price numeric(10,2),
  moq             int default 1,
  box_qty         int default 1,
  stock_qty       int default 0,
  stock_status    text default 'in_stock'
                  check (stock_status in ('in_stock','low_stock','out_of_stock')),

  image_url       text,
  gallery         jsonb default '[]'::jsonb,

  tags            text[] default '{}',
  is_featured     boolean default false,
  is_new_launch   boolean default false,
  is_fast_selling boolean default false,

  -- per-product visibility toggles (admin controls what customer sees)
  show_price      boolean default true,
  show_stock      boolean default true,
  show_moq        boolean default true,
  show_box_qty    boolean default true,
  is_published    boolean default true,

  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_published_idx on public.products(is_published);
create index if not exists products_sort_idx on public.products(sort_order);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists products_updated on public.products;
create trigger products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── 3. CUSTOMERS (extends auth.users) ─────────────────────────────
create table if not exists public.customers (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  company_name  text,
  phone         text,
  email         text,
  city          text,
  notes         text,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ── 4. ADMIN USERS (extends auth.users) ───────────────────────────
create table if not exists public.admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text default 'admin' check (role in ('admin','super_admin')),
  created_at  timestamptz default now()
);

-- helper function: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists(select 1 from public.admin_users where id = auth.uid())
$$;

-- ── 5. ENQUIRIES ──────────────────────────────────────────────────
create table if not exists public.enquiries (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid references public.customers(id) on delete set null,
  customer_snapshot  jsonb,    -- {name, company, phone} at time of enquiry
  items              jsonb not null default '[]'::jsonb,
  -- each item: {product_id, code, name, qty, unit:"box"|"pcs"}
  message            text,
  whatsapp_sent      boolean default false,
  status             text default 'new'
                     check (status in ('new','contacted','converted','lost')),
  created_at         timestamptz default now()
);

create index if not exists enquiries_customer_idx on public.enquiries(customer_id);
create index if not exists enquiries_status_idx on public.enquiries(status);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);

-- ── 6. SETTINGS (single row) ──────────────────────────────────────
create table if not exists public.settings (
  id                int  primary key default 1,
  whatsapp_number   text not null default '919207908718',
  whatsapp_display  text default '+91 92079 08718',
  company_name      text default 'Zoom Mobiles',
  tagline           text default 'A Complete Mobile Accessories Hub',
  email             text default 'sales@zoommobiles.in',
  phone             text default '+91 92079 08718',
  address           text default 'India',
  updated_at        timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into public.settings (id) values (1)
  on conflict (id) do nothing;

drop trigger if exists settings_updated on public.settings;
create trigger settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — security enforced at DB layer
-- ════════════════════════════════════════════════════════════════════

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.admin_users enable row level security;
alter table public.enquiries   enable row level security;
alter table public.settings    enable row level security;

-- ── CATEGORIES ────────────────────────────────────────────────────
drop policy if exists "categories read for logged-in" on public.categories;
create policy "categories read for logged-in" on public.categories
  for select using (auth.uid() is not null);

drop policy if exists "categories all for admin" on public.categories;
create policy "categories all for admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── PRODUCTS ──────────────────────────────────────────────────────
drop policy if exists "products read for logged-in" on public.products;
create policy "products read for logged-in" on public.products
  for select using (auth.uid() is not null and is_published = true);

drop policy if exists "products all for admin" on public.products;
create policy "products all for admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ── CUSTOMERS ─────────────────────────────────────────────────────
drop policy if exists "customers self read" on public.customers;
create policy "customers self read" on public.customers
  for select using (auth.uid() = id);

drop policy if exists "customers admin all" on public.customers;
create policy "customers admin all" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

-- ── ADMIN USERS ───────────────────────────────────────────────────
drop policy if exists "admin self read" on public.admin_users;
create policy "admin self read" on public.admin_users
  for select using (auth.uid() = id);

drop policy if exists "admin manage admin" on public.admin_users;
create policy "admin manage admin" on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());

-- ── ENQUIRIES ─────────────────────────────────────────────────────
drop policy if exists "enquiries insert customer" on public.enquiries;
create policy "enquiries insert customer" on public.enquiries
  for insert with check (auth.uid() = customer_id);

drop policy if exists "enquiries self read" on public.enquiries;
create policy "enquiries self read" on public.enquiries
  for select using (auth.uid() = customer_id);

drop policy if exists "enquiries admin all" on public.enquiries;
create policy "enquiries admin all" on public.enquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- ── SETTINGS ──────────────────────────────────────────────────────
drop policy if exists "settings read all auth" on public.settings;
create policy "settings read all auth" on public.settings
  for select using (auth.uid() is not null);

drop policy if exists "settings write admin" on public.settings;
create policy "settings write admin" on public.settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET for product images
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

drop policy if exists "product-images read public" on storage.objects;
create policy "product-images read public" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product-images write admin" on storage.objects;
create policy "product-images write admin" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images update admin" on storage.objects;
create policy "product-images update admin" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images delete admin" on storage.objects;
create policy "product-images delete admin" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ════════════════════════════════════════════════════════════════════
-- SEED — default categories (you can edit from admin panel)
-- ════════════════════════════════════════════════════════════════════
insert into public.categories (slug, name, description, icon, sort_order) values
  ('power-bank',    'Power Banks',      'High-capacity power banks',                 'BatteryCharging', 1),
  ('charger',       'Fast Chargers',    'Wall & car chargers',                       'Zap',             2),
  ('cable',         'Data Cables',      'Type-C, micro-USB, lightning',              'Cable',           3),
  ('tws',           'TWS Earbuds',      'True wireless earbuds',                     'Headphones',      4),
  ('neckband',      'Neckbands',        'Bluetooth neckband earphones',              'AudioLines',      5),
  ('speaker',       'Speakers',         'Bluetooth & party speakers',                'Speaker',         6),
  ('smart-watch',   'Smart Watches',    'Fitness & smartwatches',                    'Watch',           7),
  ('handsfree',     'Wired Handsfree',  '3.5mm earphones',                           'Headset',         8),
  ('adapter',       'Adapters',         'OTG & charging adapters',                   'Plug',            9),
  ('battery',       'Mobile Batteries', 'Replacement batteries',                     'Battery',        10),
  ('accessory',     'Accessories',      'Mobile holders, stands, others',            'Smartphone',     11)
on conflict (slug) do nothing;
