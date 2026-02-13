import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { toggleSavedListing } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export default async function SavedPage() {
  const userId = getCurrentUserId();
  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: { listing: { include: { images: true, user: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="saved-header">
        <div>
          <h1>Saved Items</h1>
          <p className="meta" style={{ marginTop: 4 }}>
            {saved.length} {saved.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <Link className="button" href="/marketplace">Browse More</Link>
      </div>

      {saved.length > 0 ? (
        <div className="saved-grid">
          {saved.map((item) => {
            const listing = item.listing;
            const isSold = listing.status === "SOLD";
            return (
              <div key={item.id} className={`saved-card${isSold ? " saved-card-sold" : ""}`}>
                <Link href={`/marketplace/${item.listingId}`} className="saved-card-image-link">
                  {listing.images[0]?.url ? (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="saved-card-placeholder" aria-hidden="true" />
                  )}
                  <span className={`saved-status-badge ${isSold ? "sold" : "available"}`}>
                    {isSold ? "Sold" : "Available"}
                  </span>
                </Link>
                <div className="saved-card-body">
                  <Link href={`/marketplace/${item.listingId}`}>
                    <h3>{listing.title}</h3>
                  </Link>
                  <p className="meta">📍 {listing.campus}</p>
                  <p className="saved-card-price">{formatPrice(listing.priceCents)}</p>
                  <div className="saved-card-actions">
                    {!isSold && (
                      <Link href={`/marketplace/${item.listingId}`} className="button primary" style={{ flex: 1 }}>
                        💬 Message Seller
                      </Link>
                    )}
                    <form action={toggleSavedListing.bind(null, item.listingId)}>
                      <SubmitButton label="♥ Remove" pendingLabel="..." />
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="saved-empty">
          <p style={{ fontSize: "2rem", marginBottom: 8 }}>♥</p>
          <h2>No saved items yet</h2>
          <p className="meta">Browse the marketplace and save items you like.</p>
          <Link className="button primary" href="/marketplace" style={{ marginTop: 16 }}>
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
