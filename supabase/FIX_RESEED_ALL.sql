-- ════════════════════════════════════════════════════════════════════
-- ALL-IN-ONE RESEED — recovers a half-set-up database
-- ════════════════════════════════════════════════════════════════════
-- Paste this whole file into Supabase Dashboard → SQL Editor → Run.
-- Safe to re-run (every step uses ON CONFLICT DO NOTHING).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. CATEGORIES (11 rows) ──────────────────────────────────────
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

-- ── 2. BRANDS (75+ rows) ─────────────────────────────────────────
insert into public.brands (slug, name, sort_order) values
  -- Mobile phone brands
  ('samsung','Samsung',1),('realme','Realme',2),('oppo','Oppo',3),('vivo','Vivo',4),
  ('xiaomi','Xiaomi',5),('redmi','Redmi',6),('iphone','iPhone',7),('oneplus','OnePlus',8),
  ('infinix','Infinix',9),('tecno','Tecno',10),('nokia','Nokia',11),('motorola','Motorola',12),
  ('lava','Lava',13),('itel','iTel',14),('generic','Generic',99),
  ('apple','Apple',20),('google','Google Pixel',21),('honor','Honor',22),
  ('huawei','Huawei',23),('asus','Asus',24),('poco','POCO',25),('nothing','Nothing',26),
  ('iqoo','iQOO',27),('micromax','Micromax',28),
  -- Audio
  ('boat','boAt',40),('jbl','JBL',41),('sony','Sony',42),('bose','Bose',43),
  ('sennheiser','Sennheiser',44),('mivi','Mivi',45),('noise','Noise',46),
  ('boult','Boult Audio',47),('portronics','Portronics',48),('ptron','pTron',49),
  ('skullcandy','Skullcandy',50),('marshall','Marshall',51),('beats','Beats',52),
  ('jabra','Jabra',53),('truke','Truke',54),('wings','Wings',55),
  ('crossbeats','Crossbeats',56),('tagg','TAGG',57),('hammer','Hammer',58),
  -- Charging
  ('anker','Anker',70),('belkin','Belkin',71),('ambrane','Ambrane',72),('mi','Mi',73),
  ('stuffcool','Stuffcool',74),('syska','Syska',75),('uni','U&i',76),('iball','iBall',77),
  ('zebronics','Zebronics',78),('robotek','Robotek',79),('iair','iAir',80),('lyne','Lyne',81),
  -- Wearables
  ('fireboltt','Fire-Boltt',100),('fastrack','Fastrack',101),('amazfit','Amazfit',102),
  ('garmin','Garmin',103),('titan','Titan',104),
  -- Cases
  ('spigen','Spigen',120),('otterbox','Otterbox',121),('ringke','Ringke',122),('uag','UAG',123),
  -- IT
  ('tplink','TP-Link',140),('dlink','D-Link',141),('logitech','Logitech',142),
  ('hp','HP',143),('dell','Dell',144),('lenovo','Lenovo',145),('acer','Acer',146),
  -- Indian
  ('intex','Intex',180),('karbonn','Karbonn',181),('detel','Detel',182),('bingo','Bingo',183),
  ('toreto','Toreto',184),('ivoltaa','iVoltaa',185),('bluei','Bluei',186),('digitek','Digitek',187)
on conflict (slug) do nothing;

-- ── 3. PRODUCTS (45 rows) ────────────────────────────────────────
insert into public.products
  (code, name, description, category_id, brand_id, brand,
   wholesale_price, moq, box_qty, stock_qty, stock_status,
   tags, is_featured, is_new_launch, is_fast_selling, sort_order)
values
  -- POWER BANKS
  ('PB-BLP797','BLP797 10000mAh Power Bank','Slim 10000mAh, dual USB, fast charging',
    (select id from public.categories where slug='power-bank'),
    (select id from public.brands where slug='realme'),'Realme',
    450,10,100,50,'in_stock',array['bestseller','10000mah'],true,false,true,1),
  ('PB-BLP833','BLP833 20000mAh Mega Power Bank','20000mAh, Type-C in/out, PD20W',
    (select id from public.categories where slug='power-bank'),
    (select id from public.brands where slug='realme'),'Realme',
    899,5,50,30,'in_stock',array['high-capacity','pd20w'],true,true,false,2),
  ('PB-AMB-1011','Ambrane Stylo-11 11000mAh','Triple output, 22.5W fast charge',
    (select id from public.categories where slug='power-bank'),
    (select id from public.brands where slug='ambrane'),'Ambrane',
    675,10,50,80,'in_stock',array['22.5w'],false,false,true,3),
  ('PB-MI-10000','Mi 3i 10000mAh Power Bank','Original Mi 18W fast charging, dual USB out',
    (select id from public.categories where slug='power-bank'),
    (select id from public.brands where slug='mi'),'Mi',
    799,5,30,20,'low_stock',array['18w'],false,false,false,4),
  ('PB-ANK-A1281','Anker PowerCore 10000 Slim','Premium Anker, ultra-slim aluminum',
    (select id from public.categories where slug='power-bank'),
    (select id from public.brands where slug='anker'),'Anker',
    1450,5,20,12,'in_stock',array['premium','slim'],true,false,false,5),

  -- CHARGERS
  ('CH-SAM-25W','Samsung 25W Super Fast Charger','Original Samsung 25W PD adapter + Type-C',
    (select id from public.categories where slug='charger'),
    (select id from public.brands where slug='samsung'),'Samsung',
    485,10,100,200,'in_stock',array['25w','pd'],true,false,true,1),
  ('CH-OP-67W-VOOC','Oppo 67W SuperVOOC Charger','67W SuperVOOC + Type-C cable',
    (select id from public.categories where slug='charger'),
    (select id from public.brands where slug='oppo'),'Oppo',
    675,10,80,120,'in_stock',array['67w','supervooc'],true,false,true,2),
  ('CH-IP-20W-USB-C','iPhone 20W USB-C Power Adapter','20W USB-C PD adapter for iPhone',
    (select id from public.categories where slug='charger'),
    (select id from public.brands where slug='iphone'),'iPhone',
    395,10,100,150,'in_stock',array['20w','pd'],false,false,true,3),
  ('CH-MI-33W','Mi 33W Sonic Charger','Mi 33W fast charger with Type-C cable',
    (select id from public.categories where slug='charger'),
    (select id from public.brands where slug='mi'),'Mi',
    420,10,100,90,'in_stock',array['33w'],false,false,false,4),
  ('CH-AMB-65W-GAN','Ambrane 65W GaN Wall Charger','Tri-port 65W GaN, USB-C PD + USB-A',
    (select id from public.categories where slug='charger'),
    (select id from public.brands where slug='ambrane'),'Ambrane',
    1199,5,20,40,'in_stock',array['gan','65w'],true,true,false,5),

  -- CABLES
  ('CB-TC-1M-BRD','Type-C Braided Cable 1m (3A)','Heavy-duty nylon, 3A fast charging',
    (select id from public.categories where slug='cable'),
    (select id from public.brands where slug='generic'),'Generic',
    35,50,500,1500,'in_stock',array['braided','3a'],true,false,true,1),
  ('CB-MU-1M','Micro USB Cable 1m','Standard micro USB, 1m, 2A',
    (select id from public.categories where slug='cable'),
    (select id from public.brands where slug='generic'),'Generic',
    18,100,1000,3000,'in_stock',array['micro-usb'],false,false,true,2),
  ('CB-LT-1M','Lightning Cable 1m','iPhone Lightning to USB-A, 2A, 1m',
    (select id from public.categories where slug='cable'),
    (select id from public.brands where slug='iphone'),'iPhone',
    65,25,200,800,'in_stock',array['lightning'],true,false,true,3),
  ('CB-CTC-PD60W','Type-C to Type-C PD 60W 1m','Premium braided, 60W PD support',
    (select id from public.categories where slug='cable'),
    (select id from public.brands where slug='belkin'),'Belkin',
    195,10,100,250,'in_stock',array['pd','60w'],false,true,false,4),
  ('CB-3IN1','3-in-1 Multi Charging Cable','Lightning + Type-C + Micro USB',
    (select id from public.categories where slug='cable'),
    (select id from public.brands where slug='generic'),'Generic',
    49,50,200,600,'in_stock',array['3-in-1'],false,false,false,5),

  -- TWS
  ('TWS-BOAT-AIR131','boAt Airdopes 131 TWS','13mm drivers, ENx, 60ms low latency',
    (select id from public.categories where slug='tws'),
    (select id from public.brands where slug='boat'),'boAt',
    899,5,30,100,'in_stock',array['bestseller','enx'],true,false,true,1),
  ('TWS-NOISE-AIR3','Noise Buds VS104 TWS','30hr playtime, IPX5, Type-C',
    (select id from public.categories where slug='tws'),
    (select id from public.brands where slug='noise'),'Noise',
    849,5,25,80,'in_stock',array['30hr','ipx5'],true,false,true,2),
  ('TWS-JBL-WAVE100','JBL Wave 100 TWS','JBL signature sound, 20hr, BT 5.0',
    (select id from public.categories where slug='tws'),
    (select id from public.brands where slug='jbl'),'JBL',
    1495,3,20,45,'in_stock',array['jbl'],true,false,false,3),
  ('TWS-MIVI-DUO5','Mivi DuoPods K5 TWS','AI noise cancellation, 50hr playtime',
    (select id from public.categories where slug='tws'),
    (select id from public.brands where slug='mivi'),'Mivi',
    699,10,40,120,'in_stock',array['anc','50hr'],false,false,true,4),
  ('TWS-BOULT-W20','Boult AirBass W20 TWS','40hr, ENC, 13mm bass drivers',
    (select id from public.categories where slug='tws'),
    (select id from public.brands where slug='boult'),'Boult Audio',
    759,5,30,65,'in_stock',array['enc','40hr'],false,false,true,5),
  ('TWS-REALME-T100','Realme Buds T100','28hr battery, 12.4mm drivers, IP55',
    (select id from public.categories where slug='tws'),
    (select id from public.brands where slug='realme'),'Realme',
    1195,5,25,50,'in_stock',array['28hr','ip55'],false,true,false,6),

  -- NECKBANDS
  ('NB-BOAT-ROCKERZ','boAt Rockerz 255 Pro+ Neckband','ASAP charge, 60hr, IPX7, magnetic',
    (select id from public.categories where slug='neckband'),
    (select id from public.brands where slug='boat'),'boAt',
    1295,5,30,70,'in_stock',array['ipx7','60hr'],true,false,true,1),
  ('NB-NOISE-TUNEACT','Noise Tune Active Neckband','30hr, dual pairing, magnetic buds',
    (select id from public.categories where slug='neckband'),
    (select id from public.brands where slug='noise'),'Noise',
    899,10,30,110,'in_stock',array['30hr'],false,false,true,2),
  ('NB-JBL-T125BT','JBL Tune 125BT Neckband','JBL Pure Bass, 16hr, dual pairing',
    (select id from public.categories where slug='neckband'),
    (select id from public.brands where slug='jbl'),'JBL',
    1450,5,25,35,'in_stock',array['pure-bass'],true,false,false,3),

  -- SPEAKERS
  ('SP-BOAT-STONE350','boAt Stone 350 Bluetooth Speaker','10W RMS, IPX7, 12hr, TWS pairing',
    (select id from public.categories where slug='speaker'),
    (select id from public.brands where slug='boat'),'boAt',
    1499,3,15,40,'in_stock',array['10w','ipx7'],true,false,true,1),
  ('SP-JBL-GO3','JBL Go 3 Portable Speaker','JBL Pro Sound, IP67, 5hr, ultra-portable',
    (select id from public.categories where slug='speaker'),
    (select id from public.brands where slug='jbl'),'JBL',
    2495,3,12,25,'in_stock',array['ip67'],true,false,true,2),
  ('SP-PORT-DECK','Portronics Decker Wooden Speaker','10W wooden body, TF/AUX/BT, FM',
    (select id from public.categories where slug='speaker'),
    (select id from public.brands where slug='portronics'),'Portronics',
    1199,5,20,55,'in_stock',array['wooden','fm'],false,true,false,3),

  -- SMART WATCHES
  ('SW-FIREBOLTT-NINJA','Fire-Boltt Ninja Call Pro Plus','1.83" display, BT calling, SpO2',
    (select id from public.categories where slug='smart-watch'),
    (select id from public.brands where slug='fireboltt'),'Fire-Boltt',
    1499,5,20,60,'in_stock',array['bt-call','spo2'],true,false,true,1),
  ('SW-BOAT-XTEND','boAt Xtend Smartwatch','1.69" HD, Alexa, 14 sports, SpO2 + HR',
    (select id from public.categories where slug='smart-watch'),
    (select id from public.brands where slug='boat'),'boAt',
    1799,5,20,40,'in_stock',array['alexa','spo2'],true,false,true,2),
  ('SW-NOISE-PULSE3','Noise Pulse 3 Smartwatch','1.96" AMOLED, BT calling, IP68',
    (select id from public.categories where slug='smart-watch'),
    (select id from public.brands where slug='noise'),'Noise',
    2199,3,15,25,'in_stock',array['amoled','bt-call'],false,true,false,3),

  -- HANDSFREE
  ('HF-SAM-AKG','Samsung AKG Wired Earphones (Type-C)','Samsung AKG-tuned, Type-C',
    (select id from public.categories where slug='handsfree'),
    (select id from public.brands where slug='samsung'),'Samsung',
    245,10,100,180,'in_stock',array['akg'],true,false,true,1),
  ('HF-BOAT-BASSHEADS','boAt BassHeads 100 Wired','10mm bass drivers, 3.5mm jack',
    (select id from public.categories where slug='handsfree'),
    (select id from public.brands where slug='boat'),'boAt',
    175,25,100,350,'in_stock',array['bass'],false,false,true,2),
  ('HF-MI-PISTON3','Mi Piston Wired Earphones','Bass-tuned, premium aluminum housing',
    (select id from public.categories where slug='handsfree'),
    (select id from public.brands where slug='mi'),'Mi',
    225,10,80,90,'in_stock',array['piston'],false,false,false,3),

  -- ADAPTERS & ACCESSORIES
  ('AD-OTG-TC','Type-C to USB-A OTG Adapter','Pocket-size OTG, USB 3.0',
    (select id from public.categories where slug='adapter'),
    (select id from public.brands where slug='generic'),'Generic',
    25,100,500,1200,'in_stock',array['otg'],false,false,true,1),
  ('AD-HDMI-TC','Type-C to HDMI 4K Adapter','Mirror phone to TV, 4K',
    (select id from public.categories where slug='adapter'),
    (select id from public.brands where slug='generic'),'Generic',
    285,10,50,100,'in_stock',array['hdmi','4k'],false,false,false,2),
  ('AC-RING-HOLDER','Magnetic Phone Ring Holder','360° rotating + car magnet',
    (select id from public.categories where slug='accessory'),
    (select id from public.brands where slug='generic'),'Generic',
    18,50,500,2000,'in_stock',array['ring'],false,false,true,3),
  ('AC-TG-GORILLA','Premium Tempered Glass (Pack of 10)','9H hardness, oleophobic',
    (select id from public.categories where slug='accessory'),
    (select id from public.brands where slug='spigen'),'Spigen',
    320,5,50,250,'in_stock',array['9h'],false,false,true,5),

  -- MOBILE BATTERIES
  ('BAT-SAM-M30','Samsung Galaxy M30 Battery (6000mAh)','Original-spec replacement',
    (select id from public.categories where slug='battery'),
    (select id from public.brands where slug='samsung'),'Samsung',
    345,10,30,60,'in_stock',array['6000mah'],false,false,false,1),
  ('BAT-RM-NOTE9','Redmi Note 9 Pro Battery (5020mAh)','BN53 compatible',
    (select id from public.categories where slug='battery'),
    (select id from public.brands where slug='redmi'),'Redmi',
    295,10,30,45,'in_stock',array['5020mah'],false,false,false,2),
  ('BAT-OP-A53','Oppo A53 Battery (5000mAh)','BLP805 compatible replacement',
    (select id from public.categories where slug='battery'),
    (select id from public.brands where slug='oppo'),'Oppo',
    265,10,30,30,'low_stock',array['5000mah'],false,false,false,3)
on conflict (code) do nothing;

-- ── 4. PLACEHOLDER IMAGES (only sets where image_url is empty) ───
update public.products p set image_url =
  case c.slug
    when 'power-bank'  then 'https://placehold.co/600x600/00C853/ffffff?text=Power%20Bank&font=montserrat'
    when 'charger'     then 'https://placehold.co/600x600/0066FF/ffffff?text=Fast%20Charger&font=montserrat'
    when 'cable'       then 'https://placehold.co/600x600/FFB800/0F172A?text=Data%20Cable&font=montserrat'
    when 'tws'         then 'https://placehold.co/600x600/0F172A/00C853?text=TWS%20Earbuds&font=montserrat'
    when 'neckband'    then 'https://placehold.co/600x600/7C3AED/ffffff?text=Neckband&font=montserrat'
    when 'speaker'     then 'https://placehold.co/600x600/DC2626/ffffff?text=Bluetooth%20Speaker&font=montserrat'
    when 'smart-watch' then 'https://placehold.co/600x600/0D9488/ffffff?text=Smart%20Watch&font=montserrat'
    when 'handsfree'   then 'https://placehold.co/600x600/DB2777/ffffff?text=Wired%20Handsfree&font=montserrat'
    when 'adapter'     then 'https://placehold.co/600x600/475569/ffffff?text=Adapter&font=montserrat'
    when 'battery'     then 'https://placehold.co/600x600/EA580C/ffffff?text=Mobile%20Battery&font=montserrat'
    when 'accessory'   then 'https://placehold.co/600x600/4F46E5/ffffff?text=Accessory&font=montserrat'
    else 'https://placehold.co/600x600/0F172A/00C853?text=Product&font=montserrat'
  end
from public.categories c
where p.category_id = c.id
  and (p.image_url is null or p.image_url = '');

-- ── 5. AUTO-LINK any products still missing brand_id ─────────────
update public.products p
   set brand_id = b.id
  from public.brands b
 where p.brand_id is null
   and p.brand is not null
   and lower(trim(p.brand)) = lower(b.name);

-- ── 6. VERIFY ────────────────────────────────────────────────────
select
  (select count(*) from public.categories) as categories,
  (select count(*) from public.brands)     as brands,
  (select count(*) from public.products)   as products,
  (select count(*) from public.products where brand_id is not null) as products_with_brand,
  (select count(*) from public.products where image_url is not null) as products_with_image;
