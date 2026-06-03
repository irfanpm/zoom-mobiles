# Zoom Mobiles — Premium B2B Wholesale Platform

> **A Complete Mobile Accessories Hub** — built with Next.js 15 App Router, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion and Zustand.

---

## ✨ Features

- **Premium landing page** — hero with floating product cards, live stats, glassmorphic features, category grid, testimonials, CTA.
- **Live inventory dashboard** — sticky filter bar, category tabs, brand & stock filters, sort, fast-selling & new-launch strips, premium product cards.
- **Smart product cards** — Box/Inner/Piece switcher, quantity stepper, live stock badge, quick WhatsApp order, add-to-enquiry.
- **Slide-over product detail** — full specs, MOQ, stock counts, dual action footer.
- **Floating enquiry bar** — sticky on every page, expandable item list, WhatsApp send.
- **Full enquiry page** — line-item editor, customer info form, live WhatsApp preview message.
- **Dynamic category pages** with branded headers.
- **PWA ready** — manifest, theme color, installable.
- **Mobile-first** responsive design (2 → 8 cols).
- **Framer Motion** throughout — page transitions, hover effects, shimmer skeletons.

---

## 🛠 Tech Stack

| Layer | Tool |
| --- | --- |
| Framework | **Next.js 15** (App Router, RSC) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 3** + custom design tokens |
| UI Primitives | **Shadcn UI** (Radix-based) |
| Animations | **Framer Motion 11** |
| Icons | **lucide-react** |
| State | **Zustand 5** (with `persist`) |
| Forms | **React Hook Form 7** |
| Toasts | **sonner** |
| Fonts | **Inter** via `next/font` |

---

## 🎨 Design System

```
Primary    #00C853   (Zoom Green)
Secondary  #0066FF   (Trust Blue)
Accent     #FFB800   (Premium Gold)
Dark       #0F172A   (Deep Slate)
Background #F8FAFC   (Soft Mist)
```

All tokens live in [`tailwind.config.ts`](tailwind.config.ts) — colors, shadows, gradients, animations.

---

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. Dev server
npm run dev      # http://localhost:3000

# 3. Production build
npm run build && npm start
```

> Node 20+ recommended.

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Header / Footer / FloatingBar)
│   ├── page.tsx                # Landing
│   ├── loading.tsx             # Global suspense
│   ├── not-found.tsx           # 404
│   ├── globals.css             # Tailwind + tokens
│   ├── products/page.tsx       # Live inventory
│   ├── categories/[slug]/      # Dynamic category pages
│   ├── enquiry/page.tsx        # Order summary + WhatsApp preview
│   └── about/page.tsx
├── components/
│   ├── brand/Logo.tsx
│   ├── layout/Header.tsx, Footer.tsx
│   ├── home/Hero.tsx, Stats.tsx, Features.tsx, Categories.tsx, CTA.tsx, Testimonials.tsx
│   ├── products/ProductCard.tsx, ProductDetailModal.tsx, FilterBar.tsx, StockBadge.tsx, ProductSkeleton.tsx, CategoryProductGrid.tsx
│   ├── enquiry/FloatingEnquiryBar.tsx
│   └── ui/                     # Shadcn primitives (Button, Card, Dialog, …)
├── store/enquiry-store.ts      # Zustand + persist
├── lib/
│   ├── config.ts               # Brand config (phone, WhatsApp, social)
│   ├── utils.ts                # cn, formatINR, …
│   └── whatsapp.ts             # Message builder + URL
├── types/index.ts
└── data/
    ├── categories.ts           # 11 categories
    └── products.ts             # 50+ seed SKUs
```

---

## 🔌 Configure your brand

Edit [`src/lib/config.ts`](src/lib/config.ts) — set the WhatsApp number, social handles, contact details. Everything in the UI (Header, Footer, Hero stats, WhatsApp links) reads from there.

```ts
export const siteConfig = {
  whatsappNumber: '919999999999',   // ← Your number (digits only, country code first)
  whatsappDisplay: '+91 99999 99999',
  email: 'sales@zoommobiles.in',
  // …
};
```

---

## 📦 Add real products

Replace [`src/data/products.ts`](src/data/products.ts) with your live SKU list, or wire it to your backend (Supabase / Strapi / custom REST). The shape lives in [`src/types/index.ts`](src/types/index.ts).

---

## 📱 PWA

Manifest at [`public/manifest.json`](public/manifest.json), favicon at [`public/favicon.svg`](public/favicon.svg). Theme color `#00C853`, installable on Android / iOS Safari (Add to Home Screen).

---

## 🧱 Architecture notes

- **Client/Server split** — Pages that don't need interactivity (about, category headers) are React Server Components by default. Interactive pieces (`'use client'`) are isolated to leaf components.
- **State** is persisted via `zustand/middleware/persist` into `localStorage` (`zoom-mobiles-enquiry`) so a buyer's enquiry survives reloads.
- **WhatsApp integration** is link-based — every "Send" action just opens `https://wa.me/...?text=...`. No backend needed for v1.
- **Design tokens** are first-class Tailwind variables — easy to white-label for other clients.

---

Built with care. © Zoom Mobiles.
