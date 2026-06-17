-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 008 — MULTI-ADMIN TEAM + PER-ADMIN PERMISSIONS + BRANDING
-- ════════════════════════════════════════════════════════════════════
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
--
-- Adds:
--  1. admin_users: email, phone, is_active, permissions (jsonb), created_by
--  2. customers.created_by — ownership (sub-admin sees only own customers)
--  3. RLS: super_admin sees all; sub-admin sees only own customers/enquiries
--  4. settings: logo_url, theme colors, about content (Appearance editor)
-- ════════════════════════════════════════════════════════════════════

-- ── 1. ADMIN_USERS extensions ─────────────────────────────────────
alter table public.admin_users
  add column if not exists email       text,
  add column if not exists phone       text,
  add column if not exists is_active   boolean default true,
  add column if not exists created_by  uuid references public.admin_users(id),
  add column if not exists permissions jsonb default '{
    "products_add": true, "products_edit": true, "products_delete": true,
    "brands_manage": true, "categories_manage": true,
    "customers_add": true, "customers_edit": true, "customers_delete": true,
    "customers_access": true, "enquiries_manage": true
  }'::jsonb;

-- Backfill existing admins (full permissions, active)
update public.admin_users
   set is_active = coalesce(is_active, true),
       permissions = coalesce(permissions, '{
        "products_add": true, "products_edit": true, "products_delete": true,
        "brands_manage": true, "categories_manage": true,
        "customers_add": true, "customers_edit": true, "customers_delete": true,
        "customers_access": true, "enquiries_manage": true
       }'::jsonb);

-- Backfill email from auth.users for display
update public.admin_users au
   set email = u.email
  from auth.users u
 where u.id = au.id and au.email is null;

-- ── 2. Helper functions (security definer = no RLS recursion) ─────
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.admin_users
    where id = auth.uid() and is_active = true
  )
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.admin_users
    where id = auth.uid() and role = 'super_admin' and is_active = true
  )
$$;

-- ── 3. CUSTOMERS ownership ────────────────────────────────────────
alter table public.customers
  add column if not exists created_by uuid references public.admin_users(id);

-- Legacy customers → assign to the first super admin
update public.customers
   set created_by = (
     select id from public.admin_users
     where role = 'super_admin' order by created_at limit 1
   )
 where created_by is null;

create index if not exists customers_created_by_idx on public.customers(created_by);

-- ── 4. RLS — customers scoped per admin ───────────────────────────
drop policy if exists "customers admin all" on public.customers;
drop policy if exists "customers super admin all" on public.customers;
drop policy if exists "customers own admin" on public.customers;

create policy "customers super admin all" on public.customers
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "customers own admin" on public.customers
  for all
  using (public.is_admin() and created_by = auth.uid())
  with check (public.is_admin() and created_by = auth.uid());
-- (the existing "customers self read" policy for the customer themselves stays)

-- ── 5. RLS — enquiries scoped per admin ───────────────────────────
drop policy if exists "enquiries admin all" on public.enquiries;
drop policy if exists "enquiries super admin all" on public.enquiries;
drop policy if exists "enquiries own-customer admin" on public.enquiries;

create policy "enquiries super admin all" on public.enquiries
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "enquiries own-customer admin" on public.enquiries
  for all using (
    public.is_admin() and exists(
      select 1 from public.customers c
      where c.id = enquiries.customer_id and c.created_by = auth.uid()
    )
  );

-- ── 6. RLS — only super admin manages the team ────────────────────
drop policy if exists "admin manage admin" on public.admin_users;
drop policy if exists "admin_users super all" on public.admin_users;

create policy "admin_users super all" on public.admin_users
  for all using (public.is_super_admin()) with check (public.is_super_admin());
-- (the existing "admin self read" policy stays — sub-admins read their own row)

-- ── 7. SETTINGS — branding columns (Appearance editor) ────────────
alter table public.settings
  add column if not exists logo_url        text,
  add column if not exists theme_primary   text default '#00C853',
  add column if not exists theme_secondary text default '#0066FF',
  add column if not exists theme_accent    text default '#FFB800',
  add column if not exists about_title     text,
  add column if not exists about_content   text;

-- ── 8. VERIFY ─────────────────────────────────────────────────────
select
  (select count(*) from public.admin_users) as admins,
  (select count(*) from public.admin_users where role = 'super_admin') as super_admins,
  (select count(*) from public.customers where created_by is not null) as owned_customers;
