# UniHub Marketplace — What Is This?

A student-only marketplace web app for buying, selling, and renting within a university network. It includes listings, chat, saved items, reviews, reporting/moderation, image uploads via Cloudflare R2, profile badges, transaction history, mutual reviews, a follow system, free stuff, bundles, housing/sublease, and dark mode.

## Key Features

- Listings: buy/sell or rent, with status, condition, price, campus, delivery options
- Multi-image upload (Cloudflare R2)
- Filters: search, category, campus, type, price range
- Sections: Today's Picks, Near You, Free Stuff
- Chat: conversations + messages
- Saved listings
- Shareable product links
- Reviews & seller ratings
- Mutual reviews: buyer and seller review each other post-transaction
- Report listing + moderation queue
- Profile badges: Verified Student, Trusted Seller (5+ sales), Quick Responder
- Transaction history: mark as sold, track sales/purchases
- Follow system: follow sellers, social proof on listings
- Bundles: group listings into discounted "Moving Out Sale" bundles
- Housing/Sublease: housing tab with filters (furnished, pets), listing form with move-in/out dates, roommates
- Dark mode: toggle in header, persists in localStorage, respects system preference
- Profile dashboard with stats, badges, bundles, transaction history

## Tech Stack

- Next.js (App Router) + TypeScript
- Prisma ORM + Neon Postgres
- Cloudflare R2 for image uploads (S3-compatible)
- Custom CSS design system (no Tailwind/shadcn)

## How It Works (High Level)

1. Users create listings with images and delivery preferences.
2. Listings are stored in Neon via Prisma; images are uploaded to R2 and stored as URLs.
3. Students browse listings, filter, save, and chat with sellers.
4. Reviews and reports help maintain trust; admins review reports in moderation queue.
5. Sellers mark listings as sold, creating a transaction record that enables mutual reviews.
6. Users earn badges based on verification, sales count, and response time.
7. Users can follow sellers and see social proof when browsing listings.
8. Bundles let students group items for a moving out sale with a discount.

## Local Setup

1. Install dependencies
```
npm install
```

2. Configure env
```
cp .env.example .env
```
Fill in Neon + R2 values. Optionally set `NEXT_PUBLIC_BASE_URL` for share links.

3. Migrate + seed
```
npm run prisma:migrate
npm run prisma:seed
```

4. Run dev server
```
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://... (Neon)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

## Pages (UI)

- `/` Home
- `/marketplace` Listings with filters, categories, tabs (All, Buy & Sell, Rentals, Free Stuff, Housing)
- `/marketplace/new` Post listing + image upload (with housing fields for Housing category)
- `/marketplace/[id]` Listing detail, gallery, badges, reviews, follow, mark-as-sold, report, share
- `/messages` Inbox
- `/messages/[id]` Chat thread
- `/saved` Saved listings
- `/profile` Profile dashboard with badges, stats, transaction history, bundles
- `/bundles/new` Create a bundle
- `/bundles/[id]` Bundle detail page
- `/admin/moderation` Reports queue

## Data Model (Prisma)

- `User`
  - fields: name, email, universityEmail, campus, imageUrl, isVerified
  - relations: listings, savedListings, reviewsReceived, reviewsWritten, sales, purchases, following, followers, bundles
- `Listing`
  - fields: title, description, priceCents, category, condition, status, transactionType, rentalPeriodDays, deliveryOptions, campus, bundleId, moveInDate, moveOutDate, furnished, roommates, petsAllowed
  - relations: images, conversations, savedBy, reviews, reports, transactions, bundle
- `ListingImage`
- `Conversation`, `ConversationParticipant`, `Message`
- `SavedListing`
- `Review` (seller rating, with optional transactionId and role for mutual reviews)
- `Report` (moderation queue)
- `Transaction` (completed trades: listingId, sellerId, buyerId, priceCents)
- `Follow` (followerId, followingId)
- `Bundle` (title, description, discountPercent, userId)

## API Endpoints

### Listings
- `GET /api/listings` — Query params: `q`, `category`, `campus`, `type`, `min`, `max`
- `POST /api/listings` — Create listing (JSON body)
- `GET /api/listings/[id]` — Get listing detail

### Conversations & Messages
- `GET /api/conversations`
- `POST /api/conversations` — Body: `{ "listingId", "sellerId", "message" }`
- `GET /api/conversations/[id]/messages`
- `POST /api/conversations/[id]/messages` — Body: `{ "body" }`

### Saved listings
- `GET /api/saved`
- `POST /api/saved` — Body: `{ "listingId" }` (toggles save)

### Reviews
- `POST /api/reviews` — Body: `{ "rating", "comment", "listingId", "sellerId" }`

### Reports
- `GET /api/reports`
- `POST /api/reports` — Body: `{ "reason", "details", "listingId" }`

### Notifications
- `GET /api/notifications/unread` — Returns unread message count

### Uploads (Cloudflare R2)
- `POST /api/uploads/r2` — Body: `{ "filename", "contentType" }` — Returns: `{ uploadUrl, publicUrl, key }`

## Server Actions

- `createListingAction(formData)` — Create listing with housing fields support
- `startConversation(formData)` — Start buyer-seller chat
- `sendMessage(conversationId, formData)` — Send message in conversation
- `toggleSavedListing(listingId)` — Save/unsave listing
- `createReview(formData)` — Leave seller review
- `createMutualReview(formData)` — Post-transaction mutual review
- `markAsSoldAction(formData)` — Mark listing as sold, create transaction
- `toggleFollow(targetUserId)` — Follow/unfollow a user
- `createBundleAction(formData)` — Create a bundle with selected listings
- `createReport(formData)` — Report a listing
- `updateReportStatus(reportId, status)` — Admin: update report status

## Auth

Currently uses a **dev user** (`demo-user`) from `lib/auth.ts`.
OAuth/domain verification is planned but not enabled.

## Notes / Limitations

- R2 uploads require a public URL (R2 public bucket or custom domain).
- Notifications are polling-based (every 5s), not WebSockets.
- Moderation page is open; add auth/role gating before production.
- Badge computation runs per-request; consider caching for production.
