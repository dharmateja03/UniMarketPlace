import Link from "next/link";
import { prisma } from "@/lib/db";

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export default async function BundlePage({ params }: { params: { id: string } }) {
  const bundle = await prisma.bundle.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      listings: { include: { images: true, user: true } },
    },
  });

  if (!bundle) {
    return <div>Bundle not found.</div>;
  }

  const totalCents = bundle.listings.reduce((sum, l) => sum + l.priceCents, 0);
  const discountedCents = Math.round(totalCents * (1 - bundle.discountPercent / 100));

  return (
    <div>
      <div className="bundle-header">
        <div>
          <span className="bundle-tag">Bundle</span>
          <h1>{bundle.title}</h1>
          {bundle.description && <p className="meta" style={{ marginTop: 8 }}>{bundle.description}</p>}
          <p className="meta">By {bundle.user.name} \u00B7 {bundle.listings.length} items</p>
        </div>
        <div className="bundle-pricing">
          {bundle.discountPercent > 0 && (
            <span className="original">{formatPrice(totalCents)}</span>
          )}
          <span className="discounted">{formatPrice(discountedCents)}</span>
          {bundle.discountPercent > 0 && (
            <span className="free-tag">{bundle.discountPercent}% OFF</span>
          )}
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: 24 }}>
        {bundle.listings.map((listing) => (
          <Link key={listing.id} className="card card-hover" href={`/marketplace/${listing.id}`}>
            {listing.images[0]?.url ? (
              <img
                className="card-image"
                src={listing.images[0].url}
                alt={listing.title}
                width={400}
                height={180}
                loading="lazy"
              />
            ) : (
              <div className="card-image placeholder" aria-hidden="true" />
            )}
            <div className="card-body">
              <p className="tag">{listing.transactionType}</p>
              <h3>{listing.title}</h3>
              <p className="price">{formatPrice(listing.priceCents)}</p>
              <p className="meta">{listing.campus}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
