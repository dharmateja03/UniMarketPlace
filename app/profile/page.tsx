import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBadges } from "@/lib/badges";
import BadgeList from "@/components/BadgeList";
import PhoneForm from "@/components/PhoneForm";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default async function ProfilePage() {
  const userId = getCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      listings: { include: { images: true }, orderBy: { createdAt: "desc" } },
      reviewsReceived: true,
      bundles: { include: { listings: { include: { images: true } } } },
    }
  });

  if (!user) {
    return <div className="detail-empty">User not found.</div>;
  }

  const [
    savedCount,
    salesCount,
    purchasesCount,
    followersCount,
    followingCount,
    recentTransactions,
    badges,
  ] = await Promise.all([
    prisma.savedListing.count({ where: { userId } }),
    prisma.transaction.count({ where: { sellerId: userId } }),
    prisma.transaction.count({ where: { buyerId: userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.transaction.findMany({
      where: { OR: [{ sellerId: userId }, { buyerId: userId }] },
      include: { listing: true, buyer: true, seller: true },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    getUserBadges(userId),
  ]);

  const activeListings = user.listings.filter((l) => l.status === "AVAILABLE");
  const soldListings = user.listings.filter((l) => l.status === "SOLD");
  const averageRating =
    user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
        user.reviewsReceived.length
      : 0;

  return (
    <div>
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-top">
          <div className="profile-header-info">
            <div className="detail-seller-avatar profile-avatar-lg">
              {user.imageUrl ? (
                <Image src={user.imageUrl} alt={user.name} width={64} height={64} sizes="64px" />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <Heading as="h1" size="7" className="profile-name">{user.name}</Heading>
              <Text as="p" size="2" color="muted">{user.universityEmail}</Text>
              <BadgeList badges={badges} />
              <div className="profile-meta-row">
                <Text size="2">⭐ <Strong>{averageRating.toFixed(1)}</Strong> <Em>({user.reviewsReceived.length} reviews)</Em></Text>
                <Text size="2"><Strong>{followersCount}</Strong> followers</Text>
                <Text size="2"><Strong>{followingCount}</Strong> following</Text>
              </div>
            </div>
          </div>
          <div className="profile-header-actions">
            <Link className="button" href="/marketplace/new">Post Item</Link>
            <Link className="button" href="/bundles/new">Create Bundle</Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <Text size="5" weight="bold" className="profile-stat-value">{activeListings.length}</Text>
            <Text size="1" weight="medium" color="muted" className="profile-stat-label">Active</Text>
          </div>
          <div className="profile-stat">
            <Text size="5" weight="bold" className="profile-stat-value">{salesCount}</Text>
            <Text size="1" weight="medium" color="muted" className="profile-stat-label">Sales</Text>
          </div>
          <div className="profile-stat">
            <Text size="5" weight="bold" className="profile-stat-value">{purchasesCount}</Text>
            <Text size="1" weight="medium" color="muted" className="profile-stat-label">Purchases</Text>
          </div>
          <div className="profile-stat">
            <Text size="5" weight="bold" className="profile-stat-value">{savedCount}</Text>
            <Text size="1" weight="medium" color="muted" className="profile-stat-label">Saved</Text>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Main Content */}
        <div className="profile-main-col">
          {/* Active Listings */}
          <div className="detail-section">
            <div className="home-section-header" style={{ marginTop: 0 }}>
              <Heading as="h2" size="5">Active Listings</Heading>
              <span className="pill">{activeListings.length}</span>
            </div>
            {activeListings.length > 0 ? (
              <div className="profile-listing-grid">
                {activeListings.map((listing) => (
                  <Link key={listing.id} className="card card-hover" href={`/marketplace/${listing.id}`}>
                    {listing.images[0]?.url ? (
                      <Image className="card-image" src={listing.images[0].url} alt={listing.title} width={400} height={400} sizes="(max-width: 768px) 50vw, 25vw" />
                    ) : (
                      <div className="card-image placeholder" aria-hidden="true" />
                    )}
                    <div className="card-body">
                      <p className="price">{formatPrice(listing.priceCents)}</p>
                      <h3>{listing.title}</h3>
                      <p className="meta">{listing.campus}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Text as="p" size="2" color="muted">No active listings. <Link href="/marketplace/new" style={{ color: "var(--accent)" }}><Em>Post one now</Em></Link></Text>
            )}
          </div>

          {/* Sold Items */}
          {soldListings.length > 0 && (
            <div className="detail-section">
              <Heading as="h2" size="5">Sold Items</Heading>
              <div className="profile-sold-list">
                {soldListings.map((listing) => (
                  <Link key={listing.id} className="profile-sold-item" href={`/marketplace/${listing.id}`}>
                    {listing.images[0]?.url ? (
                      <Image src={listing.images[0].url} alt={listing.title} width={80} height={80} sizes="80px" />
                    ) : (
                      <div className="profile-sold-placeholder" aria-hidden="true" />
                    )}
                    <div>
                      <Text as="p" size="2" weight="medium">{listing.title}</Text>
                      <Text as="p" size="1" color="muted">{formatPrice(listing.priceCents)}</Text>
                    </div>
                    <span className="pill">Sold</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bundles */}
          {user.bundles.length > 0 && (
            <div className="detail-section">
              <Heading as="h2" size="5">Your Bundles</Heading>
              <div className="profile-listing-grid">
                {user.bundles.map((bundle) => (
                  <Link className="card card-hover" key={bundle.id} href={`/bundles/${bundle.id}`}>
                    <div className="card-body">
                      <span className="bundle-tag">Bundle</span>
                      <h3>{bundle.title}</h3>
                      <p className="meta">{bundle.listings.length} items</p>
                      {bundle.discountPercent > 0 && (
                        <p className="meta">{bundle.discountPercent}% off</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History */}
          {recentTransactions.length > 0 && (
            <div className="detail-section">
              <Heading as="h2" size="5">Transaction History</Heading>
              <div className="profile-tx-list">
                {recentTransactions.map((tx) => {
                  const isSeller = tx.sellerId === userId;
                  return (
                    <Link key={tx.id} className="profile-tx-item" href={`/marketplace/${tx.listingId}`}>
                      <div>
                        <Text as="p" size="2" weight="medium">{tx.listing.title}</Text>
                        <Text as="p" size="1" color="muted">
                          {isSeller ? <>Sold to <Em>{tx.buyer.name}</Em></> : <>Bought from <Em>{tx.seller.name}</Em></>}
                        </Text>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Text as="p" size="3" weight="bold" color="accent">{formatPrice(tx.priceCents)}</Text>
                        <Text as="p" size="1" color="muted">{formatDate(tx.completedAt)}</Text>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="panel">
            <Heading as="h3" size="3">Contact Info</Heading>
            <Text as="p" size="2" color="muted" style={{ marginBottom: 8 }}><Em>Add a phone number</Em> so buyers can reach you when you opt in on listings.</Text>
            <PhoneForm currentPhone={user.phone} />
          </div>
          <div className="panel">
            <Heading as="h3" size="3">Account</Heading>
            <nav className="profile-sidebar-nav">
              <Link href="/saved">♥ Saved Items</Link>
              <Link href="/messages">💬 Messages</Link>
              <Link href="/marketplace">🔍 Browse Marketplace</Link>
            </nav>
          </div>
          <div className="panel">
            <Heading as="h3" size="3">Boost your sales</Heading>
            <Text as="p" size="2" color="muted">
              Listings with <Strong>3+ photos</Strong> sell <Em>40% faster</Em>. Add clear images and respond within 24 hours.
            </Text>
          </div>
          <div className="panel">
            <Heading as="h3" size="3">Safety</Heading>
            <Text as="p" size="2" color="muted">
              Meet in <Em>well-lit campus locations</Em> and keep communication in UniHub chat.
            </Text>
          </div>
        </aside>
      </div>
    </div>
  );
}
