import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function formatPrice(cents: number) {
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
      <h1>Saved Items</h1>
      <p className="meta" style={{ marginTop: 8 }}>
        Keep track of listings you are interested in.
      </p>
      <div className="card-grid">
        {saved.map((item) => (
          <Link key={item.id} className="card card-hover" href={`/marketplace/${item.listingId}`}>
            {item.listing.images[0]?.url ? (
              <img
                className="card-image"
                src={item.listing.images[0].url}
                alt={item.listing.title}
                width={400}
                height={180}
              />
            ) : (
              <div className="card-image placeholder" aria-hidden="true" />
            )}
            <div className="card-body">
              <p className="tag">{item.listing.transactionType}</p>
              <h3>{item.listing.title}</h3>
              <p className="price">{formatPrice(item.listing.priceCents)}</p>
              <p className="meta">{item.listing.campus}</p>
              <p className="meta">Seller: {item.listing.user.name}</p>
            </div>
          </Link>
        ))}
        {!saved.length && (
          <div className="card">
            <p>You have no saved listings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
