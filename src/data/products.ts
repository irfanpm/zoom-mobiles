import type { Product } from '@/types';

// Curated sample inventory — modeled after a real wholesale catalog
const seed: Omit<Product, 'id'>[] = [
  // ── POWER BANK ─────────────────────────────────────────────
  { name: 'Power Bank 10000mAh - Z10', code: 'PB-Z10', category: 'power-bank', brand: 'Zoom', description: 'Slim 10000mAh polymer power bank with dual output, fast charging.', box: 100, inner: 10, availableQty: 1200, moq: 10, price: 480, status: 'in-stock', tags: ['Bestseller','PD 22.5W'], isFastSelling: true },
  { name: 'Power Bank 20000mAh - Z20', code: 'PB-Z20', category: 'power-bank', brand: 'Zoom', description: 'High capacity 20000mAh with display & 3-output.', box: 60, inner: 6, availableQty: 720, moq: 6, price: 980, status: 'in-stock', isNew: true },
  { name: 'PB BLP797 / A72 / A73', code: 'BLP797', category: 'power-bank', brand: 'OPPO Compatible', description: 'OPPO A72/A73 compatible polymer power bank.', box: 100, inner: 10, availableQty: 460, moq: 10, price: 320, status: 'in-stock', isFastSelling: true },
  { name: 'PB BLPA05 / Reno 10', code: 'BLPA05', category: 'power-bank', brand: 'OPPO Compatible', description: 'Reno 10 compatible polymer cell.', box: 100, inner: 10, availableQty: 380, moq: 10, price: 360, status: 'in-stock' },
  { name: 'PB BLP697 / Reno 5', code: 'BLP697', category: 'power-bank', brand: 'OPPO Compatible', description: 'Reno 5 polymer cell, premium.', box: 100, inner: 10, availableQty: 220, moq: 10, price: 340, status: 'low-stock' },
  { name: 'PB B-O6', code: 'B-O6', category: 'power-bank', brand: 'Compatible', description: 'Universal polymer 4500mAh.', box: 100, inner: 10, availableQty: 920, moq: 10, price: 240, status: 'in-stock' },
  { name: 'PB B-O8', code: 'B-O8', category: 'power-bank', brand: 'Compatible', description: 'Universal polymer 5000mAh.', box: 100, inner: 10, availableQty: 840, moq: 10, price: 260, status: 'in-stock' },
  { name: 'PB B-N8', code: 'B-N8', category: 'power-bank', brand: 'Compatible', description: 'Premium battery cell N8.', box: 100, inner: 10, availableQty: 660, moq: 10, price: 240, status: 'in-stock' },
  { name: 'PB B-C8', code: 'B-C8', category: 'power-bank', brand: 'Compatible', description: 'Universal C8 cell.', box: 100, inner: 10, availableQty: 510, moq: 10, price: 230, status: 'in-stock' },

  // ── CHARGING CABLE ─────────────────────────────────────────
  { name: 'Type-C Data Cable 2.4A - DC101', code: 'DC101', category: 'charging-cable', brand: 'Zoom', description: 'Heavy duty braided Type-C cable, 2.4A fast.', box: 180, inner: 10, availableQty: 5400, moq: 10, price: 65, status: 'in-stock', isFastSelling: true },
  { name: 'Lightning Cable - DC106', code: 'DC106', category: 'charging-cable', brand: 'Zoom', description: 'iPhone Lightning data cable, premium quality.', box: 200, inner: 10, availableQty: 4200, moq: 10, price: 75, status: 'in-stock', isFastSelling: true },
  { name: 'Micro USB Cable - DC108', code: 'DC108', category: 'charging-cable', brand: 'Zoom', description: 'Standard Micro USB 2A cable.', box: 200, inner: 10, availableQty: 6100, moq: 10, price: 45, status: 'in-stock' },
  { name: 'Type-C to Type-C 60W - DC109', code: 'DC109', category: 'charging-cable', brand: 'Zoom', description: 'PD 60W C-to-C cable, 1m.', box: 200, inner: 10, availableQty: 2800, moq: 10, price: 120, status: 'in-stock' },
  { name: '3-in-1 Charging Cable - DC3in1', code: 'DC3in1', category: 'charging-cable', brand: 'Zoom', description: 'Multi-pin universal cable.', box: 180, inner: 10, availableQty: 1900, moq: 10, price: 95, status: 'in-stock', isNew: true },
  { name: 'OTG-C Adapter', code: 'OTGC', category: 'charging-cable', brand: 'Zoom', description: 'USB to Type-C OTG adapter.', box: 160, inner: 10, availableQty: 980, moq: 10, price: 55, status: 'in-stock' },

  // ── FAST CHARGER ───────────────────────────────────────────
  { name: '20W PD Wall Charger - SC20', code: 'SC20', category: 'fast-charger', brand: 'Zoom', description: 'Apple-style 20W PD adapter.', box: 120, inner: 12, availableQty: 1440, moq: 12, price: 220, status: 'in-stock', isFastSelling: true },
  { name: '25W Super Fast Charger - SC25', code: 'SC25', category: 'fast-charger', brand: 'Zoom', description: 'Samsung-compatible 25W PD adapter.', box: 120, inner: 12, availableQty: 1080, moq: 12, price: 260, status: 'in-stock' },
  { name: '33W VOOC Flash Charger - SC33', code: 'SC33', category: 'fast-charger', brand: 'Zoom', description: 'OPPO VOOC 33W flash adapter.', box: 60, inner: 5, availableQty: 360, moq: 5, price: 380, status: 'in-stock', isNew: true },
  { name: '65W GaN Charger - SC65', code: 'SC65', category: 'fast-charger', brand: 'Zoom', description: 'Compact GaN tri-port 65W.', box: 50, inner: 5, availableQty: 110, moq: 5, price: 850, status: 'low-stock', isNew: true },
  { name: '120W SuperVOOC Charger - SC120', code: 'SC120', category: 'fast-charger', brand: 'Zoom', description: 'High-watt SuperVOOC adapter for flagships.', box: 30, inner: 3, availableQty: 0, moq: 3, price: 1450, status: 'out-of-stock' },

  // ── TWS ────────────────────────────────────────────────────
  { name: 'TWS HERO Earbuds', code: 'TWS-HERO', category: 'tws', brand: 'Zoom', description: 'Premium TWS with HD mic, 30 hrs playtime.', box: 50, inner: 5, availableQty: 480, moq: 5, price: 540, status: 'in-stock', isFastSelling: true },
  { name: 'TWS Easy Buddy', code: 'TWS-EB', category: 'tws', brand: 'Zoom', description: 'Compact stem-style TWS, ANC.', box: 50, inner: 5, availableQty: 200, moq: 5, price: 620, status: 'in-stock' },
  { name: 'TWS Ans Star', code: 'TWS-AS', category: 'tws', brand: 'Zoom', description: 'Premium ANC TWS with glossy finish.', box: 60, inner: 5, availableQty: 240, moq: 5, price: 720, status: 'in-stock' },
  { name: 'TWS Pocket Pro', code: 'TWS-PP', category: 'tws', brand: 'Zoom', description: 'Mini in-ear TWS, tiny case.', box: 50, inner: 5, availableQty: 0, moq: 5, price: 460, status: 'out-of-stock' },

  // ── NECKBAND ───────────────────────────────────────────────
  { name: 'NB Primo Neckband', code: 'NB-PRIMO', category: 'neckband', brand: 'Zoom', description: 'Magnetic neckband, 24h playtime.', box: 72, inner: 6, availableQty: 720, moq: 6, price: 380, status: 'in-stock', isFastSelling: true },
  { name: 'NB VibeOn Bass', code: 'NB-VO', category: 'neckband', brand: 'Zoom', description: 'Bass-boosted neckband with HD mic.', box: 72, inner: 6, availableQty: 432, moq: 6, price: 420, status: 'in-stock' },
  { name: 'NB Pulse Active', code: 'NB-PA', category: 'neckband', brand: 'Zoom', description: 'Active lifestyle neckband, IPX5.', box: 60, inner: 6, availableQty: 240, moq: 6, price: 440, status: 'in-stock' },

  // ── BLUETOOTH SPEAKER ──────────────────────────────────────
  { name: 'BT Speaker - RB X200', code: 'RB-X200', category: 'bluetooth-speaker', brand: 'Zoom', description: 'Loud 10W BT speaker with RGB lights.', box: 24, inner: 4, availableQty: 144, moq: 4, price: 980, status: 'in-stock', isFastSelling: true },
  { name: 'BT Party Box - RB 5E', code: 'RB-5E', category: 'bluetooth-speaker', brand: 'Zoom', description: 'Party-style speaker with karaoke mic.', box: 12, inner: 2, availableQty: 48, moq: 2, price: 2400, status: 'in-stock' },
  { name: 'BT Mini Speaker - RB 5C', code: 'RB-5C', category: 'bluetooth-speaker', brand: 'Zoom', description: 'Compact 5W BT speaker.', box: 36, inner: 4, availableQty: 216, moq: 4, price: 640, status: 'in-stock' },

  // ── HANDSFREE ──────────────────────────────────────────────
  { name: 'HF Sur - 3.5mm Earphones', code: 'HF-SUR', category: 'handsfree', brand: 'Zoom', description: 'Premium wired earphones with HD mic.', box: 500, inner: 20, availableQty: 7500, moq: 20, price: 75, status: 'in-stock', isNew: true, isFastSelling: true },
  { name: 'HF Taal - Bass Earphones', code: 'HF-TAAL', category: 'handsfree', brand: 'Zoom', description: 'Heavy bass wired earphones.', box: 500, inner: 20, availableQty: 5400, moq: 20, price: 85, status: 'in-stock', isNew: true },
  { name: 'HF Type-C - Earphones', code: 'HF-TC', category: 'handsfree', brand: 'Zoom', description: 'Type-C connector wired earphones.', box: 300, inner: 10, availableQty: 1200, moq: 10, price: 110, status: 'in-stock' },

  // ── SMART WATCH ────────────────────────────────────────────
  { name: 'Smart Watch Pro - SW548', code: 'SW-548', category: 'smart-watch', brand: 'Zoom', description: '1.85" AMOLED, BT calling, IP67.', box: 200, inner: 10, availableQty: 800, moq: 10, price: 950, status: 'in-stock', isFastSelling: true },
  { name: 'Smart Watch Lite - SW549', code: 'SW-549', category: 'smart-watch', brand: 'Zoom', description: '1.69" HD display, heart rate, SpO2.', box: 200, inner: 10, availableQty: 600, moq: 10, price: 780, status: 'in-stock' },
  { name: 'Smart Watch Max - SW550', code: 'SW-550', category: 'smart-watch', brand: 'Zoom', description: 'Premium metal body, BT call.', box: 200, inner: 10, availableQty: 240, moq: 10, price: 1450, status: 'low-stock', isNew: true },
  { name: 'Smart Watch Kids - SW508', code: 'SW-508', category: 'smart-watch', brand: 'Zoom', description: 'Kids-friendly smart watch with games.', box: 200, inner: 10, availableQty: 480, moq: 10, price: 720, status: 'in-stock' },

  // ── BATTERIES ──────────────────────────────────────────────
  { name: 'Battery Realme 8 / Narzo 50', code: 'BAT-RM8', category: 'batteries', brand: 'Compatible', description: 'OEM-grade battery for Realme 8.', box: 100, inner: 10, availableQty: 540, moq: 10, price: 220, status: 'in-stock' },
  { name: 'Battery iPhone 11 PRO', code: 'BAT-IP11P', category: 'batteries', brand: 'Compatible', description: 'iPhone 11 Pro battery, factory tested.', box: 100, inner: 10, availableQty: 280, moq: 10, price: 480, status: 'in-stock' },
  { name: 'Battery iPhone 12 PRO', code: 'BAT-IP12P', category: 'batteries', brand: 'Compatible', description: 'iPhone 12 Pro battery, premium.', box: 100, inner: 10, availableQty: 220, moq: 10, price: 560, status: 'in-stock' },
  { name: 'Battery iPhone 12 PRO MAX', code: 'BAT-IP12PM', category: 'batteries', brand: 'Compatible', description: 'iPhone 12 Pro Max battery.', box: 100, inner: 10, availableQty: 0, moq: 10, price: 640, status: 'out-of-stock' },
  { name: 'Battery iPhone 14', code: 'BAT-IP14', category: 'batteries', brand: 'Compatible', description: 'iPhone 14 OEM-grade battery.', box: 100, inner: 10, availableQty: 320, moq: 10, price: 720, status: 'in-stock' },

  // ── ADAPTERS / ACCESSORIES ─────────────────────────────────
  { name: 'OTG-V8 Adapter', code: 'OTG-V8', category: 'adapters', brand: 'Zoom', description: 'OTG Micro V8 adapter.', box: 160, inner: 10, availableQty: 960, moq: 10, price: 35, status: 'in-stock' },
  { name: 'Car Charger Dual USB', code: 'CC-104', category: 'adapters', brand: 'Zoom', description: 'Dual USB car charger 3.4A.', box: 100, inner: 10, availableQty: 500, moq: 10, price: 180, status: 'in-stock' },
  { name: 'Car Charger Type-C PD', code: 'CC-104C', category: 'adapters', brand: 'Zoom', description: 'PD Type-C car charger 25W.', box: 100, inner: 10, availableQty: 320, moq: 10, price: 240, status: 'in-stock' },
  { name: 'Wireless Charger 15W', code: 'WC-15', category: 'adapters', brand: 'Zoom', description: 'Qi wireless charger 15W.', box: 60, inner: 6, availableQty: 180, moq: 6, price: 380, status: 'in-stock', isNew: true },

  // ── ACCESSORIES ────────────────────────────────────────────
  { name: 'Phone Holder Mount', code: 'PH-HOLD', category: 'accessories', brand: 'Zoom', description: 'Universal car phone holder.', box: 200, inner: 10, availableQty: 1100, moq: 10, price: 95, status: 'in-stock' },
  { name: 'Selfie Stick Pro', code: 'SS-PRO', category: 'accessories', brand: 'Zoom', description: 'BT selfie stick with tripod.', box: 100, inner: 10, availableQty: 480, moq: 10, price: 240, status: 'in-stock' },
  { name: 'Memory Card 64GB', code: 'MC-64', category: 'accessories', brand: 'Zoom', description: 'Class 10 microSD 64GB.', box: 200, inner: 10, availableQty: 1800, moq: 10, price: 320, status: 'in-stock' },
  { name: 'Memory Card 128GB', code: 'MC-128', category: 'accessories', brand: 'Zoom', description: 'Class 10 microSD 128GB.', box: 200, inner: 10, availableQty: 1100, moq: 10, price: 520, status: 'in-stock' },
];

export const products: Product[] = seed.map((p, i) => ({
  ...p,
  id: `${p.code.toLowerCase()}-${i + 1}`,
}));

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(slug: string) {
  if (slug === 'all') return products;
  return products.filter((p) => p.category === slug);
}

export function getFastSelling() {
  return products.filter((p) => p.isFastSelling);
}

export function getNewLaunches() {
  return products.filter((p) => p.isNew);
}
