import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { startConversation } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { images: true, user: true }
  });

  if (!listing) {
    return <div>Listing not found.</div>;
  }

  const currentUserId = getCurrentUserId();
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
            <img
              className="detail-image"
              src={imageUrl}
              alt={listing.title}
              width={900}
              height={280}
              loading="eager"
              fetchPriority="high"
            />
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
          {listing.userId !== currentUserId && (
            <form action={startConversation} style={{ marginTop: 20 }}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="sellerId" value={listing.userId} />
              <textarea
                name="message"
                placeholder="Say hi to the seller… (e.g., Can we meet today?)"
                aria-label="Message to seller"
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
