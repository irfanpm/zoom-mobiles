# 🚀 Zoom Mobiles — Full Setup Guide

End-to-end setup from zero to live site. Everything is **free**.

---

## What you're building

```
┌─ Customer side ──────────────┐    ┌─ Admin side ───────────────┐
│ /               Landing page │    │ /admin           Dashboard │
│ /login          Customer in  │    │ /admin/login     Admin in  │
│ /products       Catalog 🔒   │    │ /admin/products  CRUD      │
│ /categories/*   Categories 🔒│    │ /admin/categories CRUD     │
│ /enquiry        Send order 🔒│    │ /admin/customers Auth mgmt │
│ /about          About 🔒     │    │ /admin/enquiries Order log │
└──────────────────────────────┘    │ /admin/settings  WhatsApp# │
                                    └────────────────────────────┘
```

🔒 = login required (gated by middleware)

---

## ✅ Prerequisites (one-time)

- Node.js 20+ installed → https://nodejs.org
- A free [GitHub](https://github.com) account
- A free [Supabase](https://supabase.com) account
- A free [Cloudflare](https://cloudflare.com) account

---

## STEP 1 — Create your Supabase project

1. Go to https://app.supabase.com → **New project**
2. Fill:
   - **Name**: `zoom-mobiles`
   - **Database password**: generate a strong one — **save it**
   - **Region**: `Asia (Mumbai)` for best India speed
3. Wait ~2 minutes for provisioning.

### 1a. Run the database schema

1. Open **SQL Editor** in the Supabase dashboard
2. Click **+ New query**
3. Open `supabase/schema.sql` from this repo, copy ALL of it, paste into the editor
4. Click **Run** (Ctrl+Enter)

You should see green "Success" — this creates 6 tables, RLS policies, and an image storage bucket.

### 1b. Grab your API keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy these three values:

| Field | Location |
|---|---|
| `Project URL` | top of page, like `https://abcd.supabase.co` |
| `anon public` key | "Project API keys" section |
| `service_role` key | same section — click "Reveal" — **keep this secret** |

---

## STEP 2 — Configure local env

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
   (On Windows PowerShell: `Copy-Item .env.local.example .env.local`)

2. Open `.env.local` and paste your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

---

## STEP 3 — Create your first admin user

Supabase doesn't let you `INSERT INTO auth.users` directly via SQL — you create the user through the dashboard, then attach the admin row.

1. In Supabase dashboard → **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `admin@zoommobiles.in` (or whatever you want)
3. Password: your choice (min 6 chars)
4. ✅ Check **"Auto Confirm User"**
5. Click **Create user**
6. Copy the new user's UUID (click the user → top of detail panel)

Now make them an admin:

1. Go to **SQL Editor** → new query → paste:
   ```sql
   insert into public.admin_users (id, full_name, role)
   values ('PASTE-USER-UUID-HERE', 'Admin Name', 'super_admin');
   ```
2. Replace `PASTE-USER-UUID-HERE` with the UUID you copied
3. Run

✅ You now have an admin account.

---

## STEP 4 — Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

- **Landing page** — public, anyone sees it
- Click **Login** → enter the admin email/password? No — admin uses `/admin/login`
- Go to **http://localhost:3000/admin/login** → log in with the admin credentials you just made
- You'll land in the admin dashboard

---

## STEP 5 — Use the admin panel

### Add categories
*(skip if you ran the seed — 11 default categories are pre-loaded)*

`/admin/categories` → Add new

### Add your first product

1. `/admin/products` → **+ New Product**
2. Fill in product code, name, category
3. Upload an image
4. Set wholesale price, MOQ, box quantity, stock count
5. **Toggle visibility** (right sidebar):
   - ✅ Published in catalog
   - ✅ Show price to customer (or turn OFF to hide price from customers)
   - ✅ Show stock quantity
   - ✅ Show MOQ
   - ✅ Show box quantity
6. Click **Create Product**

### Add your first customer

1. `/admin/customers` → **+ Add Customer**
2. Enter their name, company, email, phone
3. **Set a password** (this is what they'll use to log in)
4. Click **Create Customer & Generate Login**
5. A modal appears with their credentials → click **Send via WhatsApp** to share

### Test the customer flow

1. Open **http://localhost:3000/login** in an incognito window
2. Log in with the customer credentials
3. You land on `/products` and see all published products
4. Notice: any field you toggled OFF in admin is hidden here
5. Add items to enquiry → go to `/enquiry` → click **Send on WhatsApp**
6. Back in admin → `/admin/enquiries` → you'll see the enquiry logged

---

## STEP 6 — Deploy to production (free)

### 6a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create zoom-mobiles --public --source=. --push
```
(Or create the repo on github.com and push manually.)

### 6b. Deploy frontend to Cloudflare Pages

1. https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Select your `zoom-mobiles` repo
3. Build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output**: `.next`
4. **Environment variables** (click "Add variable" for each):
   ```
   NEXT_PUBLIC_SUPABASE_URL          = https://YOUR-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
   SUPABASE_SERVICE_ROLE_KEY         = eyJ...
   NEXT_PUBLIC_SITE_URL              = https://zoom-mobiles.pages.dev
   ```
5. **Save and Deploy**

After ~3 minutes your site is live at `https://zoom-mobiles.pages.dev`.

### 6c. (Optional) Custom domain

1. Buy `zoommobiles.in` from any registrar (~₹800/year)
2. In Cloudflare Pages → Your project → **Custom domains** → add `zoommobiles.in`
3. Cloudflare gives you DNS records → set them at your registrar
4. SSL auto-installs within 5 minutes

---

## 🔒 Security checklist

- ✅ `SUPABASE_SERVICE_ROLE_KEY` is only in env vars (never committed to git)
- ✅ Row Level Security is enabled on all tables (already done by schema)
- ✅ Customer passwords are hashed by Supabase (bcrypt)
- ✅ Cloudflare adds DDoS + bot protection automatically
- ✅ Admin routes are middleware-gated (`/admin/*` requires admin user)
- ✅ Customer can only see their own enquiries (RLS policy)
- ✅ Hidden fields are stripped on the server, not just CSS (data layer)

---

## 📊 Free tier limits

| Service | Free Limit | When you'll hit it |
|---|---|---|
| Supabase Database | 500 MB | ~50,000 products |
| Supabase Auth | 50,000 MAU | 50k customer logins/month |
| Supabase Storage | 1 GB | ~10,000 product images (avg 100 KB) |
| Cloudflare Pages | Unlimited bandwidth | Never |
| Cloudflare Pages | 500 builds/month | Way more than needed |

Estimated cost at 1,000 customers / 5,000 products / 100 enquiries/day: **₹0/month**.

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| "Invalid email or password" | Check the user exists in Supabase dashboard → Authentication → Users |
| "This account does not have admin access" | You forgot Step 3 — insert into `admin_users` table |
| Product images don't upload | Check storage bucket `product-images` was created (Storage tab in Supabase) |
| Customer login works but `/products` shows empty | All products are unpublished — go to `/admin/products` and toggle Published ON |
| Build fails on Vercel | Use **Cloudflare Pages**, not Vercel — Vercel free tier is non-commercial |

---

## 📚 Useful commands

```bash
npm run dev          # Local development (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Check for lint errors
```

---

That's it. You now have a production-ready B2B wholesale platform on the free tier of every service used.
