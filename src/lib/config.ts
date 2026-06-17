export const siteConfig = {
  name: 'Zoom Mobiles',
  shortName: 'Zoom',
  tagline: 'A Complete Mobile Accessories Hub',
  description:
    "India's Largest Mobile Accessories Wholesale Hub — real-time stock, instant WhatsApp ordering and 5000+ products.",
  url: 'https://zoommobiles.in',
  whatsappNumber: '919207908718',
  whatsappDisplay: '+91 92079 08718',
  email: 'sales@zoommobiles.in',
  phone: '+91 92079 08718',
  address: 'Mumbai, Maharashtra, India',
  social: {
    instagram: 'https://instagram.com/zoommobiles',
    facebook: 'https://facebook.com/zoommobiles',
    youtube: 'https://youtube.com/@zoommobiles',
  },
  stats: {
    products: '5000+',
    brands: '200+',
    retailPartners: '10,000+',
    stock: 'Live',
  },
} as const;

export type SiteConfig = typeof siteConfig;

// ────────────────────────────────────────────────────────────────────
// 📷 PRODUCT IMAGE UPLOAD LIMITS
// ────────────────────────────────────────────────────────────────────
// Change MAX_IMAGE_MB here — it propagates to:
//   • Server-side validation in src/lib/products/actions.ts
//   • UI hint shown in src/components/admin/ImageUploader.tsx
//
// Practical guidance:
//   2  MB → tight budget · 500 images = ~1 GB (Supabase free tier limit)
//   4  MB → balanced     · 250 images = ~1 GB (DEFAULT)
//   8  MB → high quality · 125 images = ~1 GB
//   25 MB → max DSLR     · 40  images = ~1 GB
//
// Hard ceiling: Supabase free tier rejects single files > 50 MB.
// ────────────────────────────────────────────────────────────────────
export const MAX_IMAGE_MB = 4;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_IMAGE_EXT_LABEL = 'JPG · PNG · WebP · GIF';
