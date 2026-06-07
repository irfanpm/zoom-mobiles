-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 003 — ELECTRONICS BRANDS PACK
-- ════════════════════════════════════════════════════════════════════
-- Run AFTER migration_002_brands.sql.
-- Paste in Supabase Dashboard → SQL Editor → Run.
-- Safe to re-run (uses ON CONFLICT DO NOTHING).
-- ════════════════════════════════════════════════════════════════════
-- Adds ~50 popular electronic/accessory brands commonly stocked by
-- Indian B2B mobile-accessories wholesalers — audio, charging, wearables,
-- smart home, IT, gaming. Re-numbers sort_order so they show grouped
-- after mobile-phone brands.
-- ════════════════════════════════════════════════════════════════════

insert into public.brands (slug, name, sort_order) values
  -- ── Mobile phone brands (extra, missed in migration 002) ─────────
  ('apple',        'Apple',         20),
  ('google',       'Google Pixel',  21),
  ('honor',        'Honor',         22),
  ('huawei',       'Huawei',        23),
  ('asus',         'Asus',          24),
  ('poco',         'POCO',          25),
  ('nothing',      'Nothing',       26),
  ('iqoo',         'iQOO',          27),
  ('micromax',     'Micromax',      28),

  -- ── Audio · TWS · Earbuds · Speakers ─────────────────────────────
  ('boat',         'boAt',          40),
  ('jbl',          'JBL',           41),
  ('sony',         'Sony',          42),
  ('bose',         'Bose',          43),
  ('sennheiser',   'Sennheiser',    44),
  ('mivi',         'Mivi',          45),
  ('noise',        'Noise',         46),
  ('boult',        'Boult Audio',   47),
  ('portronics',   'Portronics',    48),
  ('ptron',        'pTron',         49),
  ('skullcandy',   'Skullcandy',    50),
  ('marshall',     'Marshall',      51),
  ('beats',        'Beats',         52),
  ('jabra',        'Jabra',         53),
  ('truke',        'Truke',         54),
  ('wings',        'Wings',         55),
  ('crossbeats',   'Crossbeats',    56),
  ('tagg',         'TAGG',          57),
  ('hammer',       'Hammer',        58),

  -- ── Charging · Power Banks · Cables ──────────────────────────────
  ('anker',        'Anker',         70),
  ('belkin',       'Belkin',        71),
  ('ambrane',      'Ambrane',       72),
  ('mi',           'Mi',            73),
  ('stuffcool',    'Stuffcool',     74),
  ('syska',        'Syska',         75),
  ('uni',          'U&i',           76),
  ('iball',        'iBall',         77),
  ('zebronics',    'Zebronics',     78),
  ('robotek',      'Robotek',       79),
  ('iair',         'iAir',          80),
  ('lyne',         'Lyne',          81),

  -- ── Smart Watches & Wearables ────────────────────────────────────
  ('fireboltt',    'Fire-Boltt',   100),
  ('fastrack',     'Fastrack',     101),
  ('amazfit',      'Amazfit',      102),
  ('garmin',       'Garmin',       103),
  ('titan',        'Titan',        104),

  -- ── Cases / Protection / Glass ──────────────────────────────────
  ('spigen',       'Spigen',       120),
  ('otterbox',     'Otterbox',     121),
  ('ringke',       'Ringke',       122),
  ('uag',          'UAG',          123),

  -- ── Networking / IT ──────────────────────────────────────────────
  ('tplink',       'TP-Link',      140),
  ('dlink',        'D-Link',       141),
  ('logitech',     'Logitech',     142),
  ('hp',           'HP',           143),
  ('dell',         'Dell',         144),
  ('lenovo',       'Lenovo',       145),
  ('acer',         'Acer',         146),

  -- ── Gaming ───────────────────────────────────────────────────────
  ('redgear',      'Redgear',      160),
  ('cosmic-byte',  'Cosmic Byte',  161),
  ('cooler-master','Cooler Master',162),

  -- ── Indian accessory makers ──────────────────────────────────────
  ('intex',        'Intex',        180),
  ('karbonn',      'Karbonn',      181),
  ('detel',        'Detel',        182),
  ('bingo',        'Bingo',        183),
  ('toreto',       'Toreto',       184),
  ('ivoltaa',      'iVoltaa',      185),
  ('bluei',        'Bluei',        186),
  ('digitek',      'Digitek',      187)
on conflict (slug) do nothing;

-- ── Done. Verify count ──────────────────────────────────────────
select count(*) as total_brands from public.brands;
