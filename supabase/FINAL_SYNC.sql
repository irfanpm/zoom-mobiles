-- ════════════════════════════════════════════════════════════════════
-- FINAL SCHEMA SYNC — run ONCE in Supabase SQL Editor before deploy.
-- Adds every column for every feature, backfills data, reloads cache.
-- 100% idempotent & safe to re-run. Ends all "column not found" errors.
-- ════════════════════════════════════════════════════════════════════

-- ── ADMIN_USERS: team, permissions, per-admin WhatsApp ──────────
alter table public.admin_users
  add column if not exists email            text,
  add column if not exists phone            text,
  add column if not exists whatsapp_number  text,
  add column if not exists whatsapp_display text,
  add column if not exists is_active        boolean default true,
  add column if not exists created_by       uuid references public.admin_users(id),
  add column if not exists permissions      jsonb default '{
    "products_add": true, "products_edit": true, "products_delete": true,
    "brands_manage": true, "categories_manage": true,
    "customers_add": true, "customers_edit": true, "customers_delete": true,
    "customers_access": true, "enquiries_manage": true
  }'::jsonb;

-- ── CUSTOMERS: ownership ────────────────────────────────────────
alter table public.customers
  add column if not exists created_by uuid references public.admin_users(id);

-- ── SETTINGS: branding / appearance ─────────────────────────────
alter table public.settings
  add column if not exists logo_url        text,
  add column if not exists theme_primary   text default '#00C853',
  add column if not exists theme_secondary text default '#0066FF',
  add column if not exists theme_accent    text default '#FFB800',
  add column if not exists about_title     text,
  add column if not exists about_content   text;

-- ── BACKFILL existing data ──────────────────────────────────────
update public.admin_users set is_active = true where is_active is null;
update public.customers   set is_active = true where is_active is null;
update public.admin_users au set email = u.email
  from auth.users u where u.id = au.id and au.email is null;
-- assign legacy/unowned customers to the first super admin
update public.customers set created_by = (
  select id from public.admin_users where role = 'super_admin' order by created_at limit 1
) where created_by is null;
-- seed super admin WhatsApp from global settings if empty
update public.admin_users au
   set whatsapp_number  = coalesce(au.whatsapp_number, s.whatsapp_number),
       whatsapp_display = coalesce(au.whatsapp_display, s.whatsapp_display)
  from public.settings s
 where s.id = 1 and au.role = 'super_admin' and au.whatsapp_number is null;

-- ── Helper functions (NULL-tolerant, no RLS recursion) ──────────
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.admin_users where id = auth.uid() and coalesce(is_active, true))
$$;
create or replace function public.is_super_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.admin_users where id = auth.uid() and role = 'super_admin' and coalesce(is_active, true))
$$;

-- ── Reload PostgREST cache so the API sees every new column ──────
notify pgrst, 'reload schema';

-- ── VERIFY ──────────────────────────────────────────────────────
select
  (select count(*) from public.admin_users)                                as admins,
  (select count(*) from public.customers)                                  as customers,
  (select count(*) from public.products)                                   as products,
  (select count(*) from public.brands)                                     as brands,
  (select count(*) from public.categories)                                 as categories,
  (select count(*) from public.customers where created_by is not null)     as owned_customers;
