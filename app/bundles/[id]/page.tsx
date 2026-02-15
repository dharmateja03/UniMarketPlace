import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

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
          <Heading as="h1" size="7">{bundle.title}</Heading>
          {bundle.description && <Text as="p" size="2" color="muted" style={{ marginTop: 8 }}><Em>{bundle.description}</Em></Text>}
          <Text as="p" size="2" color="muted">By <Strong>{bundle.user.name}</Strong> · {bundle.listings.length} items</Text>
        </div>
        <div className="bundle-pricing">
          {bundle.discountPercent > 0 && (
            <Text as="span" size="3" color="muted" className="original">{formatPrice(totalCents)}</Text>
          )}
          <Text as="span" size="7" weight="bold" color="accent" className="discounted">{formatPrice(discountedCents)}</Text>
          {bundle.discountPercent > 0 && (
            <span className="free-tag">{bundle.discountPercent}% OFF</span>
          )}
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: 24 }}>
        {bundle.listings.map((listing) => (
          <Link key={listing.id} className="card card-hover" href={`/marketplace/${listing.id}`}>
            {listing.images[0]?.url ? (
              <Image
                className="card-image"
                src={listing.images[0].url}
                alt={listing.title}
                width={400}
                height={180}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="card-image placeholder" aria-hidden="true" />
            )}
            <div className="card-body">
              <p className="tag">{listing.transactionType}</p>
              <h3>{listing.title}</h3>
              <Text as="p" size="3" weight="bold" color="accent" className="price">{formatPrice(listing.priceCents)}</Text>
              <Text as="p" size="1" color="muted">{listing.campus}</Text>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
