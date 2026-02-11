# UniHub Marketplace — What Is This?

A student‑only marketplace web app for buying, selling, and renting within a university network. It includes listings, chat, saved items, reviews, reporting/moderation, and image uploads via Cloudflare R2.

## Key Features

- Listings: buy/sell or rent, with status, condition, price, campus, delivery options
- Multi‑image upload (Cloudflare R2)
- Filters: search, category, campus, type, price range
- Sections: Today’s Picks, Near You
- Chat: conversations + messages
- Saved listings
- Reviews & seller ratings
- Report listing + moderation queue
- Profile dashboard

## Tech Stack

- Next.js (App Router) + TypeScript
- Prisma ORM + Neon Postgres
- Cloudflare R2 for image uploads (S3‑compatible)

## How It Works (High Level)

1. Users create listings with images and delivery preferences.
2. Listings are stored in Neon via Prisma; images are uploaded to R2 and stored as URLs.
3. Students browse listings, filter, save, and chat with sellers.
4. Reviews and reports help maintain trust; admins review reports in moderation queue.

## Local Setup

1. Install dependencies
```
npm install
```

2. Configure env
```
cp .env.example .env
```
Fill in Neon + R2 values.

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

## Pages (UI)

- `/` Home
- `/marketplace` Listings with filters, categories, picks, near‑you
- `/marketplace/new` Post listing + image upload
- `/marketplace/[id]` Listing detail, gallery, reviews, report, save
- `/messages` Inbox
- `/messages/[id]` Chat thread
- `/saved` Saved listings
- `/profile` Profile dashboard
- `/admin/moderation` Reports queue

## Data Model (Prisma)

- `User`
  - fields: name, email, universityEmail, campus, imageUrl
  - relations: listings, savedListings, reviewsReceived, reviewsWritten
- `Listing`
  - fields: title, description, priceCents, category, condition, status, transactionType, rentalPeriodDays, deliveryOptions, campus
  - relations: images, conversations, savedBy, reviews, reports
- `ListingImage`
- `Conversation`, `ConversationParticipant`, `Message`
- `SavedListing`
- `Review` (seller rating)
- `Report` (moderation queue)

## API Endpoints

### Listings
- `GET /api/listings`
  - Query params: `q`, `category`, `campus`, `type`, `min`, `max`
- `POST /api/listings`
  - Body (JSON):
    ```json
    {
      "title": "string",
      "description": "string",
      "priceCents": 1234,
      "category": "string",
      "condition": "string",
      "campus": "string",
      "transactionType": "SELL|RENT",
      "rentalPeriodDays": 30,
      "deliveryOptions": ["MEETUP", "DELIVERY", "PICKUP"],
      "imageUrl": "https://...",
      "imageUrls": ["https://..."]
    }
    ```

- `GET /api/listings/[id]`

### Conversations & Messages
- `GET /api/conversations`
- `POST /api/conversations`
  - Body: `{ "listingId": "...", "sellerId": "...", "message": "..." }`
- `GET /api/conversations/[id]/messages`
- `POST /api/conversations/[id]/messages`
  - Body: `{ "body": "..." }`

### Saved listings
- `GET /api/saved`
- `POST /api/saved`
  - Body: `{ "listingId": "..." }` (toggles save)

### Reviews
- `POST /api/reviews`
  - Body: `{ "rating": 1-5, "comment": "...", "listingId": "...", "sellerId": "..." }`

### Reports
- `GET /api/reports`
- `POST /api/reports`
  - Body: `{ "reason": "...", "details": "...", "listingId": "..." }`

### Notifications
- `GET /api/notifications/unread`
  - Returns unread message count

### Uploads (Cloudflare R2)
- `POST /api/uploads/r2`
  - Body: `{ "filename": "...", "contentType": "image/..." }`
  - Returns: `{ uploadUrl, publicUrl, key }`

## Server Actions

- `createListingAction(formData)`
- `startConversation(formData)`
- `sendMessage(conversationId, formData)`
- `toggleSavedListing(listingId)`
- `createReview(formData)`
- `createReport(formData)`
- `updateReportStatus(reportId, status)`

## Auth

Currently uses a **dev user** (`demo-user`) from `lib/auth.ts`.
OAuth/domain verification is planned but not enabled.

## Notes / Limitations

- R2 uploads require a public URL (R2 public bucket or custom domain).
- Notifications are polling‑based (every 5s), not WebSockets.
- Moderation page is open; add auth/role gating before production.
