import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { toggleSavedListing } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

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
          <Heading as="h1" size="7">Saved Items</Heading>
          <Text as="p" size="2" color="muted" style={{ marginTop: 4 }}>
            <Strong>{saved.length}</Strong> {saved.length === 1 ? "item" : "items"} saved
          </Text>
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
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      width={400}
                      height={300}
                      sizes="(max-width: 768px) 100vw, 300px"
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
                  <Text as="p" size="1" color="muted">📍 {listing.campus}</Text>
                  <Text as="p" size="3" weight="bold" color="accent" className="saved-card-price">{formatPrice(listing.priceCents)}</Text>
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
          <Heading as="h2" size="5">No saved items yet</Heading>
          <Text as="p" size="2" color="muted">Browse the marketplace and <Em>save items you like</Em>.</Text>
          <Link className="button primary" href="/marketplace" style={{ marginTop: 16 }}>
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
