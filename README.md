# Garg Paints & Hardware — Store Website

An order-first storefront for **Garg Paints & Hardware**, a wholesaler and
retailer of paint additives, binders, wall textures and plastering tools in
Ballabgarh, Faridabad (Haryana, India).

No payment gateway: the site builds an order list and hands the buyer to
**WhatsApp** (pre-filled order message) or **IndiaMART**, with a final GST
invoice confirmed by the shop. Lead capture collects a mobile number
(no OTP) and notifies the shop.

## Stack

- **Next.js 16** (App Router, static prerendering), **TypeScript** strict
- **Tailwind CSS v4**, shadcn/base-ui, lucide icons
- Zustand cart (persisted, versioned with migrations)
- Custom interactive demos: interior colour visualizer (home) and facade
  visualizer (About) with madrasi dana shades, chamki glitter toggle and
  shade auto-cycling (all reduced-motion aware)
- SEO: JSON-LD (HardwareStore/WebSite/Product/ProductGroup/FAQPage/
  BreadcrumbList), sitemap, robots (incl. AI crawlers), llms.txt, OG images
- Art: hand-authored SVGs rasterized to WebP (`scripts/generate-art.mts`)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

```bash
npm run build      # production build (all pages static)
npm run lint       # eslint
npm run verify     # order-path checks: exact WhatsApp message template,
                   # wa.me encoding, pricing, JSON-LD offer rules, GST rules
```

Browser end-to-end checks live in `scripts/` (require a local Chrome binary;
see `scripts/check-*.mjs`).

## Deployment

Deploys as a standard Next.js app (Node runtime) — Vercel/Netlify/
Cloudflare Pages(OpenNext)/self-hosted `next start` all work.

- `NEXT_PUBLIC_SITE_URL` — set to the final production domain (canonical,
  OG, sitemap, llms.txt all read it).
- `/api/lead` writes submitted numbers to `data/leads.jsonl` on the server.
  That directory is git-ignored and must be persisted per host if lead
  logging matters.

## Data rules (do not break)

- The GST number is intentionally absent from the entire site.
- HSN codes are shown as owner-provided and require CA verification before
  invoicing.
- No delivery times, certifications, ratings or prices may be invented —
  anything not provided by the owner renders as "Contact for Price".
- WhatsApp message template and units are owner-approved; `npm run verify`
  enforces them.
