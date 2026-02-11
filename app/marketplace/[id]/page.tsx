import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { startConversation } from "@/app/actions";

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
    include: { user: true },
    take: 4
  });

  const recommendationIds = new Set(primaryRecommendations.map((item) => item.id));
  const fallbackRecommendations =
    primaryRecommendations.length < 4
      ? await prisma.listing.findMany({
          where: {
            id: { notIn: [listing.id, ...recommendationIds] }
          },
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 4 - primaryRecommendations.length
        })
      : [];

  const recommendations = [...primaryRecommendations, ...fallbackRecommendations];

  return (
    <div>
      <div className="listing-detail">
        <div className="panel">
          <p className="tag">{listing.transactionType}</p>
          <h1>{listing.title}</h1>
          <p style={{ color: "var(--muted)" }}>{listing.campus}</p>
          <p style={{ fontSize: "1.2rem", marginTop: 12 }}>{formatPrice(listing.priceCents)}</p>
          <p style={{ marginTop: 16 }}>{listing.description}</p>
          <p style={{ marginTop: 16 }}>Condition: {listing.condition}</p>
          {listing.rentalPeriodDays && (
            <p>Rental period: {listing.rentalPeriodDays} days</p>
          )}
        </div>
        <div className="panel">
          <h3>Seller</h3>
          <p>{listing.user.name}</p>
          <p style={{ color: "var(--muted)" }}>{listing.user.universityEmail}</p>
          {listing.userId !== currentUserId && (
            <form action={startConversation} style={{ marginTop: 20 }}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="sellerId" value={listing.userId} />
              <textarea name="message" placeholder="Say hi to the seller" />
              <button className="button primary" type="submit">Start Chat</button>
            </form>
          )}
          {listing.userId === currentUserId && (
            <p style={{ marginTop: 20, color: "var(--muted)" }}>
              This is your listing.
            </p>
          )}
        </div>
      </div>

      <h2 className="section-title">Recommended for you</h2>
      <div className="card-grid">
        {recommendations.map((item) => (
          <Link key={item.id} className="card" href={`/marketplace/${item.id}`}>
            <p className="tag">{item.transactionType}</p>
            <h3>{item.title}</h3>
            <p>{formatPrice(item.priceCents)}</p>
            <p style={{ color: "var(--muted)" }}>{item.campus}</p>
            <p style={{ fontSize: "0.9rem" }}>Seller: {item.user.name}</p>
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
