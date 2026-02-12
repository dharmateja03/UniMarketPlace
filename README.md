# UniHub Marketplace

Student-only marketplace web app for buying, selling, and renting on campus. Built with Next.js + TypeScript + Prisma (Neon/Postgres).

## Setup

1. Install deps
```
npm install
```

2. Configure env
```
cp .env.example .env
```
Fill `DATABASE_URL` with your Neon connection string.
Set `R2_*` variables for Cloudflare R2 uploads.
Optionally set `NEXT_PUBLIC_BASE_URL` for shareable links (defaults to `http://localhost:3000`).

3. Generate Prisma client + migrate + seed
```
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start dev server
```
npm run dev
```

## Features

### Core Marketplace
- Listings: buy/sell or rent, with status, condition, price, campus, delivery options
- Multi-image upload (Cloudflare R2)
- Filters: search, category, campus, type, price range
- Sections: Today's Picks, Near You, Buy & Sell, Rentals
- Chat: conversations + messages tied to listings
- Saved listings
- Reviews & seller ratings
- Report listing + moderation queue
- Shareable product links

### Social & Trust
- **Profile Badges** — Verified Student, Trusted Seller (5+ sales), Quick Responder (< 1hr avg response)
- **Transaction History** — Mark listings as sold, track completed sales/purchases with buyer selection
- **Mutual Reviews** — Both buyer and seller can review each other after a transaction completes
- **Follow System** — Follow sellers, see social proof ("X bought from this seller") on listing pages

### Marketplace Sections
- **Free Stuff** — Dedicated tab for free items (priceCents = 0), FREE tag on cards
- **Bundles** — Group listings into "Moving Out Sale" bundles with a discount percentage
- **Housing / Sublease** — Housing tab with filters for furnished, pets allowed; listing form shows move-in/out dates, roommates, furnished status when category is "Housing"

### UI
- **Dark Mode** — Toggle in header, persists in localStorage, respects system `prefers-color-scheme`
- Custom CSS design system (no Tailwind/shadcn) with warm, minimalist aesthetic

## Key Files

- `prisma/schema.prisma` — Database models
- `app/actions.ts` — Server actions
- `app/marketplace/page.tsx` — Marketplace with tabs and filters
- `app/marketplace/[id]/page.tsx` — Listing detail with badges, reviews, follow, mark-as-sold
- `app/profile/page.tsx` — Profile with badges, stats, transaction history, bundles
- `app/bundles/[id]/page.tsx` — Bundle detail page
- `app/bundles/new/page.tsx` — Create bundle page
- `lib/badges.ts` — Badge computation logic
- `components/ThemeToggle.tsx` — Dark mode toggle

## Notes
- OAuth and university domain verification are planned next. Current auth uses a dev user (`demo-user`).
- Message notifications are polled every 5 seconds (no WebSockets).
- Listing images are uploaded to Cloudflare R2 via signed URLs.
- Moderation page is open; add auth/role gating before production.
