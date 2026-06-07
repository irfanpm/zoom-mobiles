-- ════════════════════════════════════════════════════════════════════
-- MIGRATION 004 — SAMPLE PRODUCT SEED
-- ════════════════════════════════════════════════════════════════════
-- Run AFTER migrations 002 + 003 (needs brands + categories tables).
-- Adds 40+ realistic mobile-accessories with proper category/brand links.
-- Safe to re-run (ON CONFLICT DO NOTHING on `code`).
-- ════════════════════════════════════════════════════════════════════

-- Helper note: we use subqueries to look up category_id & brand_id by slug
-- so this works regardless of the UUIDs Supabase generated.

-- ── 1. POWER BANKS ────────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('PB-BLP797',  'BLP797 10000mAh Power Bank',
    'Slim 10000mAh polymer battery, dual USB output, fast charging',
    (select id from public.categories where slug = 'power-bank'),
    (select id from public.brands where slug = 'realme'), 'Realme',
    450, 10, 100, 50, 'in_stock',
    array['bestseller','fast-charge','10000mah'], true, false, true, 1),

  ('PB-BLP833', 'BLP833 20000mAh Mega Power Bank',
    '20000mAh capacity, Type-C in/out, PD20W fast charging, LED indicator',
    (select id from public.categories where slug = 'power-bank'),
    (select id from public.brands where slug = 'realme'), 'Realme',
    899, 5, 50, 30, 'in_stock',
    array['high-capacity','pd20w','type-c'], true, true, false, 2),

  ('PB-AMB-1011', 'Ambrane Stylo-11 11000mAh',
    'Triple output, 22.5W fast charge, premium metal finish',
    (select id from public.categories where slug = 'power-bank'),
    (select id from public.brands where slug = 'ambrane'), 'Ambrane',
    675, 10, 50, 80, 'in_stock',
    array['triple-output','22.5w'], false, false, true, 3),

  ('PB-MI-10000', 'Mi 3i 10000mAh Power Bank',
    'Original Mi 18W fast charging, dual USB out, premium build',
    (select id from public.categories where slug = 'power-bank'),
    (select id from public.brands where slug = 'mi'), 'Mi',
    799, 5, 30, 20, 'low_stock',
    array['original','18w'], false, false, false, 4),

  ('PB-ANK-A1281', 'Anker PowerCore 10000 Slim',
    'Premium Anker PowerCore, 10000mAh, ultra-slim aluminum body',
    (select id from public.categories where slug = 'power-bank'),
    (select id from public.brands where slug = 'anker'), 'Anker',
    1450, 5, 20, 12, 'in_stock',
    array['premium','slim','aluminum'], true, false, false, 5),

  ('PB-SY-MAGNET', 'Syska MagSafe 10000mAh',
    'Wireless MagSafe magnetic power bank, 15W wireless + 22.5W wired',
    (select id from public.categories where slug = 'power-bank'),
    (select id from public.brands where slug = 'syska'), 'Syska',
    1199, 5, 25, 0, 'out_of_stock',
    array['wireless','magsafe'], false, true, false, 6)
on conflict (code) do nothing;

-- ── 2. CHARGERS ───────────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('CH-SAM-25W', 'Samsung 25W Super Fast Charger',
    'Original Samsung 25W PD adapter with Type-C cable',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'samsung'), 'Samsung',
    485, 10, 100, 200, 'in_stock',
    array['25w','pd','samsung'], true, false, true, 1),

  ('CH-OP-67W-VOOC', 'Oppo 67W SuperVOOC Charger',
    '67W SuperVOOC fast charger with USB-A to Type-C cable',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'oppo'), 'Oppo',
    675, 10, 80, 120, 'in_stock',
    array['67w','supervooc'], true, false, true, 2),

  ('CH-IP-20W-USB-C', 'iPhone 20W USB-C Power Adapter',
    'Genuine-style 20W USB-C PD adapter for iPhone',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'iphone'), 'iPhone',
    395, 10, 100, 150, 'in_stock',
    array['20w','usb-c','pd'], false, false, true, 3),

  ('CH-MI-33W', 'Mi 33W Sonic Charger',
    'Mi 33W fast charger with Type-C cable',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'mi'), 'Mi',
    420, 10, 100, 90, 'in_stock',
    array['33w','sonic'], false, false, false, 4),

  ('CH-AMB-65W-GAN', 'Ambrane 65W GaN Wall Charger',
    'Tri-port 65W GaN tech, USB-C PD + USB-A QC3.0',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'ambrane'), 'Ambrane',
    1199, 5, 20, 40, 'in_stock',
    array['gan','65w','tri-port'], true, true, false, 5),

  ('CH-CAR-DUAL', 'Dual USB Car Charger 3.4A',
    'Generic dual port car charger, 3.4A total, smart IC',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    85, 20, 200, 500, 'in_stock',
    array['car','dual-port'], false, false, false, 6)
on conflict (code) do nothing;

-- ── 3. DATA CABLES ────────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('CB-TC-1M-BRD', 'Type-C Braided Cable 1m (3A)',
    'Heavy duty nylon braided Type-C cable, 3A fast charging, 1m length',
    (select id from public.categories where slug = 'cable'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    35, 50, 500, 1500, 'in_stock',
    array['type-c','braided','3a'], true, false, true, 1),

  ('CB-MU-1M', 'Micro USB Cable 1m',
    'Standard micro USB charging cable, 1m, 2A',
    (select id from public.categories where slug = 'cable'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    18, 100, 1000, 3000, 'in_stock',
    array['micro-usb','basic'], false, false, true, 2),

  ('CB-LT-1M', 'Lightning Cable 1m (MFi-style)',
    'iPhone Lightning to USB-A cable, 2A, 1m',
    (select id from public.categories where slug = 'cable'),
    (select id from public.brands where slug = 'iphone'), 'iPhone',
    65, 25, 200, 800, 'in_stock',
    array['lightning','iphone'], true, false, true, 3),

  ('CB-CTC-PD60W', 'Type-C to Type-C PD 60W 1m',
    'Premium braided Type-C to Type-C cable, 60W PD support',
    (select id from public.categories where slug = 'cable'),
    (select id from public.brands where slug = 'belkin'), 'Belkin',
    195, 10, 100, 250, 'in_stock',
    array['type-c','pd','60w'], false, true, false, 4),

  ('CB-3IN1', '3-in-1 Multi Charging Cable',
    'One cable, three ends: Lightning + Type-C + Micro USB',
    (select id from public.categories where slug = 'cable'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    49, 50, 200, 600, 'in_stock',
    array['3-in-1','multi'], false, false, false, 5),

  ('CB-MAG-LED', 'Magnetic LED Charging Cable',
    'Magnetic auto-attach cable with LED indicator, 3-in-1 tip',
    (select id from public.categories where slug = 'cable'),
    (select id from public.brands where slug = 'portronics'), 'Portronics',
    149, 20, 100, 0, 'out_of_stock',
    array['magnetic','led'], false, true, false, 6)
on conflict (code) do nothing;

-- ── 4. TWS EARBUDS ────────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('TWS-BOAT-AIR131', 'boAt Airdopes 131 TWS',
    'Best-selling TWS, 13mm drivers, ENx noise cancellation, 60ms low latency',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'boat'), 'boAt',
    899, 5, 30, 100, 'in_stock',
    array['bestseller','enx','low-latency'], true, false, true, 1),

  ('TWS-NOISE-AIR3', 'Noise Buds VS104 TWS',
    'Up to 30hr playtime, IPX5, dual EQ modes, Type-C charging',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'noise'), 'Noise',
    849, 5, 25, 80, 'in_stock',
    array['30hr','ipx5'], true, false, true, 2),

  ('TWS-JBL-WAVE100', 'JBL Wave 100 TWS',
    'Original JBL signature sound, 20hr battery, Bluetooth 5.0',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'jbl'), 'JBL',
    1495, 3, 20, 45, 'in_stock',
    array['jbl-sound','premium'], true, false, false, 3),

  ('TWS-MIVI-DUO5', 'Mivi DuoPods K5 TWS',
    'AI noise cancellation, 50hr playtime, Made in India',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'mivi'), 'Mivi',
    699, 10, 40, 120, 'in_stock',
    array['anc','50hr','made-in-india'], false, false, true, 4),

  ('TWS-BOULT-W20', 'Boult AirBass W20 TWS',
    '40hr playtime, ENC, 13mm bass-boost drivers',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'boult'), 'Boult Audio',
    759, 5, 30, 65, 'in_stock',
    array['enc','40hr','bass'], false, false, true, 5),

  ('TWS-IP-PRO2', 'iPhone Buds Pro 2 (ANC Compatible)',
    'AirPods-style design with ANC, in-ear pop-up, wireless charging case',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'iphone'), 'iPhone',
    1899, 3, 20, 30, 'low_stock',
    array['anc','airpods-style','popup'], true, true, false, 6),

  ('TWS-REALME-T100', 'Realme Buds T100',
    '28hr battery, 12.4mm bass drivers, IP55 sweat resistant',
    (select id from public.categories where slug = 'tws'),
    (select id from public.brands where slug = 'realme'), 'Realme',
    1195, 5, 25, 50, 'in_stock',
    array['28hr','ip55'], false, true, false, 7)
on conflict (code) do nothing;

-- ── 5. NECKBANDS ──────────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('NB-BOAT-ROCKERZ', 'boAt Rockerz 255 Pro+ Neckband',
    'ASAP charge, 60hr playback, IPX7, magnetic earbuds',
    (select id from public.categories where slug = 'neckband'),
    (select id from public.brands where slug = 'boat'), 'boAt',
    1295, 5, 30, 70, 'in_stock',
    array['ipx7','60hr','asap-charge'], true, false, true, 1),

  ('NB-NOISE-TUNEACT', 'Noise Tune Active Neckband',
    '30hr playtime, dual pairing, magnetic buds',
    (select id from public.categories where slug = 'neckband'),
    (select id from public.brands where slug = 'noise'), 'Noise',
    899, 10, 30, 110, 'in_stock',
    array['30hr','dual-pair'], false, false, true, 2),

  ('NB-JBL-T125BT', 'JBL Tune 125BT Neckband',
    'JBL Pure Bass sound, 16hr battery, dual pairing',
    (select id from public.categories where slug = 'neckband'),
    (select id from public.brands where slug = 'jbl'), 'JBL',
    1450, 5, 25, 35, 'in_stock',
    array['pure-bass','jbl'], true, false, false, 3),

  ('NB-MIVI-COLLAR2', 'Mivi Collar 2 Neckband',
    '24hr playtime, fast charge, ENC mic',
    (select id from public.categories where slug = 'neckband'),
    (select id from public.brands where slug = 'mivi'), 'Mivi',
    699, 10, 30, 95, 'in_stock',
    array['24hr','fast-charge','enc'], false, false, false, 4)
on conflict (code) do nothing;

-- ── 6. SPEAKERS ───────────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('SP-BOAT-STONE350', 'boAt Stone 350 Bluetooth Speaker',
    '10W RMS, IPX7 waterproof, 12hr playtime, TWS pairing',
    (select id from public.categories where slug = 'speaker'),
    (select id from public.brands where slug = 'boat'), 'boAt',
    1499, 3, 15, 40, 'in_stock',
    array['10w','ipx7','12hr'], true, false, true, 1),

  ('SP-JBL-GO3', 'JBL Go 3 Portable Speaker',
    'Original JBL Pro Sound, IP67, 5hr playtime, ultra-portable',
    (select id from public.categories where slug = 'speaker'),
    (select id from public.brands where slug = 'jbl'), 'JBL',
    2495, 3, 12, 25, 'in_stock',
    array['ip67','portable','original'], true, false, true, 2),

  ('SP-PORT-DECK', 'Portronics Decker Wooden Speaker',
    '10W premium wooden body, TF/AUX/BT, FM radio',
    (select id from public.categories where slug = 'speaker'),
    (select id from public.brands where slug = 'portronics'), 'Portronics',
    1199, 5, 20, 55, 'in_stock',
    array['wooden','fm','aux'], false, true, false, 3),

  ('SP-ZEB-COUNTY', 'Zebronics County Bluetooth Speaker',
    '3W output, TF card, USB, FM, AUX, 8hr playback',
    (select id from public.categories where slug = 'speaker'),
    (select id from public.brands where slug = 'zebronics'), 'Zebronics',
    699, 10, 30, 80, 'in_stock',
    array['fm','tf-card','budget'], false, false, true, 4),

  ('SP-MARSH-EMB2', 'Marshall Emberton II',
    'Premium 20+ hour playtime, IP67, stereo signature sound',
    (select id from public.categories where slug = 'speaker'),
    (select id from public.brands where slug = 'marshall'), 'Marshall',
    9999, 1, 5, 8, 'low_stock',
    array['premium','ip67','20hr'], true, false, false, 5)
on conflict (code) do nothing;

-- ── 7. SMART WATCHES ──────────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('SW-FIREBOLTT-NINJA', 'Fire-Boltt Ninja Call Pro Plus',
    '1.83" display, Bluetooth calling, 100+ sports modes, SpO2',
    (select id from public.categories where slug = 'smart-watch'),
    (select id from public.brands where slug = 'fireboltt'), 'Fire-Boltt',
    1499, 5, 20, 60, 'in_stock',
    array['bt-call','spo2','sports'], true, false, true, 1),

  ('SW-BOAT-XTEND', 'boAt Xtend Smartwatch',
    '1.69" HD, Alexa built-in, 14 sports modes, SpO2 + heart rate',
    (select id from public.categories where slug = 'smart-watch'),
    (select id from public.brands where slug = 'boat'), 'boAt',
    1799, 5, 20, 40, 'in_stock',
    array['alexa','spo2','hr'], true, false, true, 2),

  ('SW-NOISE-PULSE3', 'Noise Pulse 3 Smartwatch',
    '1.96" AMOLED, BT calling, 600+ watch faces, IP68',
    (select id from public.categories where slug = 'smart-watch'),
    (select id from public.brands where slug = 'noise'), 'Noise',
    2199, 3, 15, 25, 'in_stock',
    array['amoled','bt-call','ip68'], false, true, false, 3),

  ('SW-AMZ-BIP5', 'Amazfit Bip 5 Smartwatch',
    '1.91" HD, GPS, Alexa, 10-day battery',
    (select id from public.categories where slug = 'smart-watch'),
    (select id from public.brands where slug = 'amazfit'), 'Amazfit',
    4995, 3, 10, 15, 'in_stock',
    array['gps','10-day','alexa'], false, true, false, 4)
on conflict (code) do nothing;

-- ── 8. HANDSFREE (wired) ──────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('HF-SAM-AKG', 'Samsung AKG Wired Earphones (Type-C)',
    'Original Samsung AKG-tuned, Type-C, in-line controls',
    (select id from public.categories where slug = 'handsfree'),
    (select id from public.brands where slug = 'samsung'), 'Samsung',
    245, 10, 100, 180, 'in_stock',
    array['akg','type-c'], true, false, true, 1),

  ('HF-BOAT-BASSHEADS', 'boAt BassHeads 100 Wired',
    '10mm bass-boosted drivers, 3.5mm jack, in-line mic',
    (select id from public.categories where slug = 'handsfree'),
    (select id from public.brands where slug = 'boat'), 'boAt',
    175, 25, 100, 350, 'in_stock',
    array['bass','3.5mm'], false, false, true, 2),

  ('HF-MI-PISTON3', 'Mi Piston Wired Earphones',
    'Bass-tuned dynamic drivers, premium aluminum housing',
    (select id from public.categories where slug = 'handsfree'),
    (select id from public.brands where slug = 'mi'), 'Mi',
    225, 10, 80, 90, 'in_stock',
    array['piston','aluminum'], false, false, false, 3)
on conflict (code) do nothing;

-- ── 9. ADAPTERS & ACCESSORIES ─────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('AD-OTG-TC', 'Type-C to USB-A OTG Adapter',
    'Pocket-size OTG, USB 3.0, supports keyboards & pen-drives',
    (select id from public.categories where slug = 'adapter'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    25, 100, 500, 1200, 'in_stock',
    array['otg','usb-3'], false, false, true, 1),

  ('AD-HDMI-TC', 'Type-C to HDMI 4K Adapter',
    'Mirror phone to TV in 4K, premium aluminum',
    (select id from public.categories where slug = 'adapter'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    285, 10, 50, 100, 'in_stock',
    array['hdmi','4k','tv-mirror'], false, false, false, 2),

  ('AC-RING-HOLDER', 'Magnetic Phone Ring Holder',
    '360° rotating finger ring holder + car magnet, premium metal',
    (select id from public.categories where slug = 'accessory'),
    (select id from public.brands where slug = 'generic'), 'Generic',
    18, 50, 500, 2000, 'in_stock',
    array['ring','holder'], false, false, true, 3),

  ('AC-CARMOUNT-MAG', 'Magnetic Car Mount (Dashboard)',
    'Strong N52 magnet, 360° rotation, suits all phone sizes',
    (select id from public.categories where slug = 'accessory'),
    (select id from public.brands where slug = 'portronics'), 'Portronics',
    149, 20, 50, 180, 'in_stock',
    array['car-mount','magnetic'], false, false, false, 4),

  ('AC-TG-GORILLA', 'Premium Tempered Glass (Universal)',
    '9H hardness, oleophobic coating, edge-to-edge protection (pack of 10)',
    (select id from public.categories where slug = 'accessory'),
    (select id from public.brands where slug = 'spigen'), 'Spigen',
    320, 5, 50, 250, 'in_stock',
    array['tempered-glass','9h'], false, false, true, 5)
on conflict (code) do nothing;

-- ── 10. MOBILE BATTERIES ──────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  ('BAT-SAM-M30', 'Samsung Galaxy M30 Battery (6000mAh)',
    'Original-spec replacement battery for Samsung Galaxy M30',
    (select id from public.categories where slug = 'battery'),
    (select id from public.brands where slug = 'samsung'), 'Samsung',
    345, 10, 30, 60, 'in_stock',
    array['6000mah','m30'], false, false, false, 1),

  ('BAT-RM-NOTE9', 'Redmi Note 9 Pro Battery (5020mAh)',
    'BN53 compatible, 5020mAh, premium cells',
    (select id from public.categories where slug = 'battery'),
    (select id from public.brands where slug = 'redmi'), 'Redmi',
    295, 10, 30, 45, 'in_stock',
    array['5020mah','bn53'], false, false, false, 2),

  ('BAT-OP-A53', 'Oppo A53 Battery (5000mAh)',
    'BLP805 compatible replacement, 5000mAh',
    (select id from public.categories where slug = 'battery'),
    (select id from public.brands where slug = 'oppo'), 'Oppo',
    265, 10, 30, 30, 'low_stock',
    array['5000mah','blp805'], false, false, false, 3)
on conflict (code) do nothing;

-- ── Verify count ──────────────────────────────────────────────────
select count(*) as total_products from public.products;
