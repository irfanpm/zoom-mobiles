# 🚀 Deploy Zoom Mobiles to Cloudflare (truly free forever)

We use **Cloudflare Workers + OpenNext adapter** — free tier with commercial use allowed, unlimited bandwidth.

| Layer | Service | Cost | Notes |
|---|---|---|---|
| **Site + admin + API** | Cloudflare Workers (OpenNext) | Free (100K requests/day) | Commercial use ✅ |
| **Database + auth + storage** | Supabase | Free (already set up) | — |
| **Domain** (optional) | Cloudflare Registrar | ~₹900/yr | Cheapest option |
| **Total** | | **₹0–75/month** | |

> Free Workers plan = **100,000 requests/day** + **unlimited bandwidth**. A small B2B portal with 50 customers each viewing 100 pages/day = 5,000 requests = **5%** of free quota.

---

## 📋 Pre-flight checklist

Before you start:
- [x] All Supabase migrations have been run (you've done this)
- [x] Admin user exists
- [x] At least one customer exists
- [x] Local dev (`npm run dev`) works
- [ ] You have a GitHub account → https://github.com/signup (free)
- [ ] You have a Cloudflare account → https://dash.cloudflare.com/sign-up (free)

---

## STEP 1 — Push code to GitHub (5 min)

### 1a. Install Git if you haven't
https://git-scm.com/download/win → install with defaults.

### 1b. Create a private GitHub repo
1. https://github.com/new
2. Name: `zoom-mobiles`
3. Visibility: **Private**
4. **Don't check** "Add README" or anything
5. Click **Create repository** — keep the page open

### 1c. Push from your project folder

In PowerShell:

```powershell
cd "C:\Users\hp\Desktop\MOBILE SHOPS"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/zoom-mobiles.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If asked for credentials, a browser will pop up — log in to GitHub → it remembers you next time.

✅ Refresh the GitHub page — files should be there.

---

## STEP 2 — Test the Cloudflare build locally (5 min)

Before deploying, verify the build works on your machine.

```powershell
cd "C:\Users\hp\Desktop\MOBILE SHOPS"
npm run cf:build
```

This compiles your Next.js app into a Cloudflare Worker. Takes 2–3 minutes. You should see:
```
✅ Worker built successfully → .open-next/worker.js
```

### Test the build locally

Create a file called `.dev.vars` in the project root with your Supabase secrets:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:8788
```

Then run:
```powershell
npm run cf:preview
```

Opens http://localhost:8788 — same as `npm run dev` but running through the actual Cloudflare runtime. Verify login + products + enquiries all work.

> If anything fails here, it'll also fail on production. Fix it locally first.

---

## STEP 3 — Deploy to Cloudflare Workers (5 min)

### 3a. Log in to Cloudflare

```powershell
npx wrangler login
```

Opens a browser → click **Allow** → returns to terminal.

### 3b. Deploy

```powershell
npm run cf:deploy
```

First-time deploy asks you to confirm the worker name (`zoom-mobiles`) — press Enter.

After ~2 minutes you'll get a URL like:
```
https://zoom-mobiles.YOUR-SUBDOMAIN.workers.dev
```

Click it → ✅ Your site is LIVE on Cloudflare.

---

## STEP 4 — Set production env vars in Cloudflare (2 min)

The local `.dev.vars` doesn't get deployed. You must set production env vars in the dashboard.

1. https://dash.cloudflare.com → **Workers & Pages** → click **zoom-mobiles**
2. **Settings** tab → **Variables and Secrets**
3. Add each variable:

| Name | Type | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Plaintext | `https://YOUR-REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plaintext | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** 🔒 | `sb_secret_...` |
| `NEXT_PUBLIC_SITE_URL` | Plaintext | `https://zoom-mobiles.YOUR-SUBDOMAIN.workers.dev` |

> Mark `SUPABASE_SERVICE_ROLE_KEY` as **Secret** so it's encrypted and never logged.

4. Click **Deploy** to apply variables → worker auto-redeploys

---

## STEP 5 — Tell Supabase about your new URL (1 min)

Supabase needs your live URL whitelisted for auth cookies to work.

1. Supabase dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: paste your `.workers.dev` URL
3. **Redirect URLs**: paste the same URL
4. Click **Save**

---

## STEP 6 — Test the live site (5 min)

Open your `.workers.dev` URL in **incognito** and verify:

| Test | Expected |
|---|---|
| Visit `/` | ↪️ Redirects to `/login` |
| Login as admin | ↪️ Lands on `/admin` dashboard |
| Login as customer | ↪️ Lands on `/products` |
| Add product to cart, click **Send WhatsApp** | WhatsApp tab opens |
| Admin checks `/admin/enquiries` | Sees the enquiry |
| Upload a product image | Saves to Supabase Storage, shows on card |
| Brand restrictions work | Restricted customer sees fewer products |

---

## STEP 7 — Custom domain (optional, ~₹900/year)

### 7a. Buy a domain
Cheapest: **Cloudflare Registrar** (no markup, ~$10/yr)
1. https://dash.cloudflare.com → **Registrar** → Search `zoommobiles.in`
2. Buy → it's automatically added to Cloudflare DNS

(Or use GoDaddy / Hostinger / Namecheap and follow their DNS instructions.)

### 7b. Attach to your worker
1. Cloudflare dashboard → **Workers & Pages** → **zoom-mobiles** → **Settings** → **Domains & Routes**
2. Click **Add → Custom Domain**
3. Enter `zoommobiles.in` (or `app.zoommobiles.in`)
4. Cloudflare auto-creates the DNS record + SSL — wait ~1 minute
5. ✅ `https://zoommobiles.in` now serves your worker

### 7c. Update env vars + Supabase

Repeat **STEP 4** and **STEP 5** with the new domain:
- Cloudflare env var `NEXT_PUBLIC_SITE_URL` = `https://zoommobiles.in`
- Supabase URL Configuration: Site URL + Redirect URLs = `https://zoommobiles.in`

Redeploy: `npm run cf:deploy` (or push to GitHub for auto-deploy — see Step 8).

---

## STEP 8 — Auto-deploy on every Git push (optional but recommended)

Connect Cloudflare to GitHub so every `git push` triggers a deploy.

1. Cloudflare dashboard → **Workers & Pages** → **Create**
2. **Pages → Connect to Git** → authorize GitHub → pick `zoom-mobiles` repo
3. **Build settings**:
   - **Framework preset**: None (custom)
   - **Build command**: `npm run cf:build`
   - **Build output directory**: `.open-next`
   - **Root directory**: `/`
4. **Environment variables**: same as STEP 4
5. **Save and Deploy**

After this, every `git push` → Cloudflare detects → builds → deploys in ~3 minutes.

---

## 🔄 Future code updates

```powershell
git add .
git commit -m "Describe your change"
git push
```

If you set up auto-deploy (STEP 8) → Cloudflare auto-deploys.
Otherwise: `npm run cf:deploy` manually.

---

## 💰 Cost summary

| Plan | Cost | When you'd need it |
|---|---|---|
| **Free tier (Workers + Supabase)** | ₹0/month | Up to 100K page views/day, 500 MB DB, 1 GB images |
| **+ Custom domain** | +₹75/month | Professional URL |
| **Supabase Pro (when DB > 500 MB)** | +$25/month | If you have >5000 products with descriptions |
| **Workers Paid (when requests > 100K/day)** | +$5/month | Heavy traffic |

Realistic estimate for your usage: **₹75/month forever** (just the domain).

---

## 🆘 Common issues

| Problem | Fix |
|---|---|
| **`npm run cf:build` fails: "wrangler not authenticated"** | Run `npx wrangler login` first |
| **Build succeeds locally but fails on Pages** | Wrong env vars — recheck STEP 4 |
| **"Application error" on /products** | Probably missed setting `SUPABASE_SERVICE_ROLE_KEY` as a SECRET |
| **Login redirects in a loop** | Forgot STEP 5 (Supabase URL Configuration) |
| **Images don't load** | Check `*.supabase.co` is in `next.config.mjs` images.remotePatterns (it is) |
| **403 RLS errors** | Anon key wrong, or wrong project URL |

---

## 🛡️ Production hardening checklist

After your site is live:

- [ ] **Rotate Supabase secret key** (you shared it in chat earlier):
  - Supabase → Settings → API → 🔄 next to secret key
  - Update Cloudflare env var → redeploy
- [ ] **Enable Cloudflare WAF** (free):
  - Cloudflare dashboard → Security → WAF → enable managed rules
- [ ] **Enable Bot Fight Mode** (free):
  - Security → Bots → On
- [ ] **Set up email alerts** for failed builds:
  - Workers & Pages → Settings → Notifications

---

## 📞 Need help?

- **OpenNext Cloudflare docs**: https://opennext.js.org/cloudflare
- **Cloudflare Workers docs**: https://developers.cloudflare.com/workers
- **Supabase docs**: https://supabase.com/docs

For project-specific issues, check the terminal where you ran `npm run cf:preview` — full errors appear there.
