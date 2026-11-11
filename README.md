# Garg Paints & Hardware — Store Website

An order-first storefront for **Garg Paints & Hardware**, a wholesaler and
retailer of paint additives, binders, wall textures and plastering tools in
Ballabgarh, Faridabad (Haryana, India).

No payment gateway: the site builds an order list and hands the buyer to
**WhatsApp** (pre-filled order message with item, variant, quantity and
units) or **IndiaMART**, with a final GST invoice confirmed by the shop.
Lead capture collects a mobile number (no OTP) and pushes it to the shop.

**Live:** https://garg-paints-hardware.vercel.app
**Repo:** https://github.com/AmnGrg0511/garg-paints-hardware

## Screenshots

| | |
|---|---|
| ![Home](docs/screenshots/home-desktop.png) | ![Catalog](docs/screenshots/catalog-desktop.png) |
| **Home — colour visualizer + starter kit** | **Catalog with filters and search** |
| ![Product](docs/screenshots/product-desktop.png) | ![Cart](docs/screenshots/cart-drawer.png) |
| **Product detail — variant selector, bulk steppers** | **Order list with per-line bulk steppers** |
| ![Facade demo](docs/screenshots/facade-demo-desktop.png) | ![Checkout](docs/screenshots/checkout-desktop.png) |
| **About — facade demo + chamki finish** | **Checkout — two order channels** |
| ![Mobile](docs/screenshots/home-mobile.png) | |
| **Mobile-first ordering bar** | |

## Stack

- **Next.js 16** (App Router, static prerendering), **TypeScript** strict
- **Tailwind CSS v4**, shadcn/base-ui, lucide icons
- Zustand cart (persisted, versioned with migrations)
- Interactive demos: interior colour visualizer (home) and facade visualizer
  (About) with madrasi dana shades, a chamki glitter finish
  (Golden/Silver/Off) and shade auto-cycling (all reduced-motion aware)
- **Order this setup**: one tap builds a starter kit for the picked shade —
  dana bag, pidicryl drum, CMC kg, chamki and a gurmala — fully adjustable in
  the order list
- Bulk-aware quantity steppers: bags ±1/±10/±100 (≈35–40 kg per bag), CMC and
  chamki in kg ±1/±5/±25 (5/25 kg bags, odd weights fine), pidicryl in drums
- Lead capture without OTP; forwards to an optional webhook
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

**Live on Vercel:** https://garg-paints-hardware.vercel.app
(Pushes to `main` redeploy automatically.)

### Environment variables

- `NEXT_PUBLIC_SITE_URL` — set to the final production domain (canonical,
  OG, sitemap and llms.txt all read it). Already set on Vercel.
- `LEAD_WEBHOOK_URL` *(optional)* — POSTs every submitted lead as JSON
  `{ phone, source, at, text }` so the owner receives it without any
  visitor action. Two easy setups:
  - **Telegram**: create a bot with @BotFather, then point the webhook at
    `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>`
    (add `&parse_mode=HTML` if you like) and set `LEAD_WEBHOOK_URL` to that
    URL in your host's env settings.
  - **Google Sheets**: deploy an Apps Script web app that appends
    `e.parameter`/POST body rows to a sheet, and set its URL here.

## Data rules (do not break)

- The GST number is intentionally absent from the entire site.
- HSN codes are shown as owner-provided and require CA verification before
  invoicing.
- No delivery times, certifications, ratings or prices may be invented —
  anything not provided by the owner renders as "Contact for Price".
- The WhatsApp message template and per-unit quantities are owner-approved;
  `npm run verify` enforces them.
- Starter-kit quantities (`starterKit` in `src/config/businessData.ts`) are
  placeholders pending the owner's standard usage rates.
