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
