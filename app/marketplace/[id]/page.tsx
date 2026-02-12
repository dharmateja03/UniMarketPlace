import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { createReport, createReview, startConversation, toggleSavedListing } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import ShareButton from "@/components/ShareButton";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function formatDelivery(option: string) {
  switch (option) {
    case "MEETUP":
      return "Meet on campus";
    case "DELIVERY":
      return "Local delivery";
    case "PICKUP":
      return "Pickup only";
    default:
      return option;
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "RESERVED":
      return "Reserved";
    case "SOLD":
      return "Sold";
    default:
      return status;
  }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      user: true,
      reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" } },
      savedBy: true
    }
  });

  if (!listing) {
    return <div>Listing not found.</div>;
  }

  const currentUserId = getCurrentUserId();
  const isSaved = listing.savedBy.some((save) => save.userId === currentUserId);
  const averageRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
      : 0;
  const priceMin = Math.round(listing.priceCents * 0.8);
  const priceMax = Math.round(listing.priceCents * 1.2);

  const primaryRecommendations = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      category: listing.category,
      campus: listing.campus,
      transactionType: listing.transactionType,
      priceCents: { gte: priceMin, lte: priceMax }
    },
    include: { user: true, images: true },
    take: 4
  });

  const recommendationIds = new Set(primaryRecommendations.map((item) => item.id));
  const fallbackRecommendations =
    primaryRecommendations.length < 4
      ? await prisma.listing.findMany({
          where: {
            id: { notIn: [listing.id, ...recommendationIds] }
          },
          include: { user: true, images: true },
          orderBy: { createdAt: "desc" },
          take: 4 - primaryRecommendations.length
        })
      : [];

  const recommendations = [...primaryRecommendations, ...fallbackRecommendations];

  const imageUrl = listing.images[0]?.url;

  return (
    <div>
      <div className="listing-detail">
        <div className="panel">
          {imageUrl ? (
            <div className="gallery">
              <img
                className="detail-image"
                src={imageUrl}
                alt={listing.title}
                width={900}
                height={280}
                loading="eager"
                fetchPriority="high"
              />
              <div className="gallery-grid">
                {listing.images.slice(1, 5).map((img) => (
                  <img key={img.id} src={img.url} alt={listing.title} loading="lazy" />
                ))}
              </div>
            </div>
          ) : (
            <div className="detail-image placeholder" aria-hidden="true" />
          )}
          <p className="tag" style={{ marginTop: 16 }}>
            {listing.transactionType}
          </p>
          <h1>{listing.title}</h1>
          <p className="meta">{listing.campus}</p>
          <p className="price" style={{ marginTop: 10 }}>
            {formatPrice(listing.priceCents)}
          </p>
          <p className="meta">Status: {formatStatus(listing.status)}</p>
          <p className="meta">
            Delivery: {listing.deliveryOptions.length ? listing.deliveryOptions.map(formatDelivery).join(", ") : "Meet on campus"}
          </p>
          <div className="share-row">
            <ShareButton
              title={listing.title}
              url={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/marketplace/${listing.id}`}
            />
          </div>
          <p style={{ marginTop: 16 }}>{listing.description}</p>
          <p style={{ marginTop: 16 }}>Condition: {listing.condition}</p>
          {listing.rentalPeriodDays && (
            <p>Rental period: {listing.rentalPeriodDays} days</p>
          )}
        </div>
        <div className="panel">
          <h3>Seller</h3>
          <p>{listing.user.name}</p>
          <p className="meta">{listing.user.universityEmail}</p>
          <p className="meta">
            Rating: {averageRating.toFixed(1)} ({listing.reviews.length} reviews)
          </p>
          {listing.userId !== currentUserId && (
            <form action={toggleSavedListing.bind(null, listing.id)} style={{ marginTop: 12 }}>
              <SubmitButton label={isSaved ? "Saved" : "Save Listing"} pendingLabel="Saving…" />
            </form>
          )}
          {listing.userId !== currentUserId && (
            <form action={startConversation} style={{ marginTop: 20 }}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="sellerId" value={listing.userId} />
              <label className="sr-only" htmlFor="seller-message">
                Message to seller
              </label>
              <textarea
                id="seller-message"
                name="message"
                placeholder="Say hi to the seller… (e.g., Can we meet today?)"
                autoComplete="off"
              />
              <SubmitButton label="Start Chat" pendingLabel="Starting…" />
            </form>
          )}
          {listing.userId === currentUserId && (
            <p style={{ marginTop: 20, color: "var(--muted)" }}>
              This is your listing.
            </p>
          )}
        </div>
      </div>

      <div className="profile-sections">
        <section>
          <h2 className="section-title">Reviews</h2>
          <div className="review-list">
            {listing.reviews.map((review) => (
              <div className="panel" key={review.id}>
                <p className="tag">Rating {review.rating}/5</p>
                <p style={{ fontWeight: 600 }}>{review.reviewer.name}</p>
                {review.comment && <p className="meta">{review.comment}</p>}
              </div>
            ))}
            {!listing.reviews.length && (
              <div className="panel">
                <p className="meta">No reviews yet.</p>
              </div>
            )}
          </div>

          {listing.userId !== currentUserId && (
            <form action={createReview} className="panel" style={{ marginTop: 16 }}>
              <input type="hidden" name="sellerId" value={listing.userId} />
              <input type="hidden" name="listingId" value={listing.id} />
              <label className="sr-only" htmlFor="rating">
                Rating
              </label>
              <select id="rating" name="rating" defaultValue="5">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Bad</option>
              </select>
              <label className="sr-only" htmlFor="comment">
                Review comment
              </label>
              <textarea id="comment" name="comment" placeholder="Write a short review…" />
              <SubmitButton label="Post Review" pendingLabel="Posting…" />
            </form>
          )}
        </section>

        <aside className="profile-side">
          <div className="panel">
            <h3>Report listing</h3>
            <form action={createReport} style={{ marginTop: 12 }}>
              <input type="hidden" name="listingId" value={listing.id} />
              <label className="sr-only" htmlFor="report-reason">
                Report reason
              </label>
              <input id="report-reason" name="reason" placeholder="Reason (e.g., scam)" required />
              <label className="sr-only" htmlFor="report-details">
                Report details
              </label>
              <textarea id="report-details" name="details" placeholder="Add details (optional)" />
              <SubmitButton label="Submit Report" pendingLabel="Sending…" />
            </form>
          </div>
        </aside>
      </div>

      <h2 className="section-title">Recommended for You</h2>
      <div className="card-grid">
        {recommendations.map((item) => (
          <Link key={item.id} className="card card-hover" href={`/marketplace/${item.id}`}>
            {item.images?.[0]?.url ? (
              <img
                className="card-image"
                src={item.images[0].url}
                alt={item.title}
                width={400}
                height={180}
                loading="lazy"
              />
            ) : (
              <div className="card-image placeholder" aria-hidden="true" />
            )}
            <div className="card-body">
              <p className="tag">{item.transactionType}</p>
              <h3>{item.title}</h3>
              <p className="price">{formatPrice(item.priceCents)}</p>
              <p className="meta">{item.campus}</p>
              <p className="meta">Seller: {item.user.name}</p>
            </div>
          </Link>
        ))}
        {!recommendations.length && (
          <div className="card">
            <p>No recommendations yet. Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
