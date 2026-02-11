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

## Notes
- OAuth and university domain verification are planned next. Current auth uses a dev user (`demo-user`).
- Listings support sell or rent with optional rental period.
- Chat uses conversations + messages tied to listings.
- Marketplace includes filters + simple recommendations.
- Message notifications are polled every 5 seconds (no WebSockets).
- Listing images can be uploaded to Cloudflare R2 via a signed URL.

## Key files
- `prisma/schema.prisma`
- `app/marketplace/page.tsx`
- `app/messages/[id]/page.tsx`
- `app/actions.ts`
# UniMarketPlace
