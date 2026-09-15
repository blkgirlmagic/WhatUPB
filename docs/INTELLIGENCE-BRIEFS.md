# WhatUPB Intelligence Briefs — Workflow

This document covers the full workflow for publishing a new paid intelligence brief.

---

## Architecture Summary

| Layer | File | Purpose |
|-------|------|---------|
| Data | `src/lib/intelligence-reports.ts` | All report metadata |
| Library page | `src/app/intelligence/page.tsx` | Grid of all briefs |
| Detail page | `src/app/intelligence/[slug]/page.tsx` | Report product page |
| Access page | `src/app/intelligence/[slug]/access/page.tsx` | Post-payment download page |
| Download API | `src/app/api/intelligence/download/route.ts` | Server-side Stripe verify + signed URL |
| Storage | Supabase bucket `intelligence-briefs` | Private PDF storage |
| Payment | Stripe Payment Link | Checkout (no server code needed) |

**Security constraints (never violate these):**
- `STRIPE_SECRET_KEY` is server-only. Never use `NEXT_PUBLIC_STRIPE_*`.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never use it in client code.
- PDFs live in a **private** Supabase Storage bucket — never in `/public`.
- Stripe session verification happens in the API route — never trust `?paid=true`.
- Signed URLs expire in 10 minutes — never return permanent storage URLs.

---

## Step-by-Step: Adding a New Brief

### 1. Write the PDF

Produce the finished PDF. Name it following the pattern:
```
whatupb-{slug}-{month}-{year}.pdf
```
Example: `whatupb-signals-october-2026.pdf`

---

### 2. Upload the PDF to Supabase Storage

1. Go to **Supabase Dashboard → Storage → intelligence-briefs**
2. Create a folder: `brief-{NNN}` (e.g. `brief-002`)
3. Upload the PDF into that folder:
   ```
   brief-002/whatupb-signals-october-2026.pdf
   ```
4. Confirm the bucket is **private** (Row Level Security enabled, no public access).

The storage path pattern the download API expects:
```
brief-{briefNumber}/whatupb-{slug}-{publicationDate-lowercase-hyphenated}.pdf
```
The API derives this path automatically from the report data in `intelligence-reports.ts`.

---

### 3. Create a Stripe Payment Link

1. In your **Stripe Dashboard → Payment Links → Create link**
2. Create a one-time product for the brief (e.g. "WhatUPB Intelligence Brief 002 — Signals")
3. Set the price.
4. Under **After payment**, set the redirect URL to:
   ```
   https://whatupb.com/intelligence/{slug}/access?session_id={CHECKOUT_SESSION_ID}
   ```
   The `{CHECKOUT_SESSION_ID}` is Stripe's dynamic variable — Stripe replaces it automatically.
5. Copy the Payment Link URL (looks like `https://buy.stripe.com/...`).

---

### 4. Add a Cover Image

Place the cover image at:
```
public/intelligence/brief-{NNN}-{slug}.png
```
Example: `public/intelligence/brief-002-signals.png`

Recommended size: 800×1100 px (portrait). If no image yet, the CSS cover art block renders a styled placeholder automatically.

---

### 5. Add the Report to `intelligence-reports.ts`

Open `src/lib/intelligence-reports.ts` and add a new entry to the `intelligenceReports` array:

```typescript
{
  slug: "signals",           // URL slug — matches /intelligence/signals
  briefNumber: "002",        // Zero-padded number
  title: "SIGNALS",          // Short all-caps title
  subtitle: "Where the Data Points. What It Means.",
  description: "A concise WhatUPB intelligence report examining...",
  teaser: "One-paragraph hook for the library card.",
  publicationDate: "October 2026",
  pageCount: 12,
  price: 12.99,
  coverImage: "/intelligence/brief-002-signals.png",
  stripePaymentLink: "https://buy.stripe.com/live_xxxxxxxxxxxx",
  status: "available",
  topics: ["Topic A", "Topic B", "Topic C"],
},
```

Set `status: "coming-soon"` if you want the card visible but not purchasable before launch.

---

### 6. Create the Detail and Access Pages

Create two new files by copying the CLARITY brief structure:

**Detail page:** `src/app/intelligence/{slug}/page.tsx`
- Copy `src/app/intelligence/clarity/page.tsx`
- Replace `getReport("clarity")` with `getReport("{slug}")`
- Update `metadata.title` and `metadata.description`
- Update the "What's Inside" section content for the new brief

**Access page:** `src/app/intelligence/{slug}/access/page.tsx`
- Copy `src/app/intelligence/clarity/access/page.tsx`
- Replace `getReport("clarity")` with `getReport("{slug}")`
- Update `metadata.title`

The download API route (`/api/intelligence/download`) is **shared** — no changes needed there. It derives the storage path from the slug automatically.

---

### 7. Verify Environment Variables

Confirm these are set in production (Vercel or your host):

| Variable | Required for |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe session verification in download route |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage signed URL generation |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase connection (already set for newsletter) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon operations (already set) |

**Never prefix `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.**

---

### 8. Test Locally

1. Run `npm run dev`
2. Navigate to `/intelligence` — new card should appear
3. Navigate to `/intelligence/{slug}` — detail page should render
4. Use a Stripe test mode Payment Link and test card (`4242 4242 4242 4242`) to complete a checkout
5. Confirm redirect to `/intelligence/{slug}/access?session_id=cs_test_...`
6. Confirm the PDF download works (signed URL redirect from the API)
7. Try navigating directly to `/intelligence/{slug}/access` without `session_id` — should redirect back to detail page
8. Check that the PDF URL is not guessable (it's a short-lived signed Supabase URL, not a permanent path)

---

### 9. Build and Deploy

```powershell
# In your project directory
npm run build
git add -A
git commit -m "Add Intelligence Brief 002 — Signals"
git push
```

---

## Supabase Storage Setup (one-time)

If the bucket doesn't exist yet:

1. **Supabase Dashboard → Storage → New bucket**
2. Name: `intelligence-briefs`
3. **Public: OFF** (private bucket)
4. Enable RLS
5. Do **not** add any public policies — access is exclusively through server-generated signed URLs using the service-role key

---

## Stripe Redirect URL Format

The Stripe Payment Link redirect must use Stripe's variable syntax:
```
https://whatupb.com/intelligence/{slug}/access?session_id={CHECKOUT_SESSION_ID}
```
Stripe replaces `{CHECKOUT_SESSION_ID}` at runtime. The access page passes it to `/api/intelligence/download` which verifies it server-side.

---

## File Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| PDF filename | `whatupb-{slug}-{month}-{year}.pdf` | `whatupb-clarity-september-2026.pdf` |
| Storage folder | `brief-{NNN}/` | `brief-001/` |
| Cover image | `/public/intelligence/brief-{NNN}-{slug}.png` | `brief-001-clarity.png` |
| URL slug | lowercase, hyphen-separated | `clarity`, `market-signals` |

---

*Last updated: September 2026*
