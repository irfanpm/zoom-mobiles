-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 009 — PER-ADMIN WHATSAPP NUMBERS
-- ════════════════════════════════════════════════════════════════════
-- Each admin gets their own WhatsApp number. A customer's enquiry routes
-- to the WhatsApp of the admin who created that customer (customers.created_by).
-- Falls back to the global settings number when an admin has none.
--
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
-- ════════════════════════════════════════════════════════════════════

alter table public.admin_users
  add column if not exists whatsapp_number  text,
  add column if not exists whatsapp_display text;

-- Seed the existing super admin's WhatsApp from global settings (one-time convenience)
update public.admin_users au
   set whatsapp_number  = coalesce(au.whatsapp_number, s.whatsapp_number),
       whatsapp_display = coalesce(au.whatsapp_display, s.whatsapp_display)
  from public.settings s
 where s.id = 1
   and au.role = 'super_admin'
   and au.whatsapp_number is null;

-- Reload PostgREST schema cache so the API sees the new columns immediately
notify pgrst, 'reload schema';

-- Verify
select full_name, role, whatsapp_number, whatsapp_display
from public.admin_users
order by created_at;
