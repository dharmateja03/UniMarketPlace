import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBadges } from "@/lib/badges";
import BadgeList from "@/components/BadgeList";
import PhoneForm from "@/components/PhoneForm";

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
                <img src={user.imageUrl} alt={user.name} />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="profile-name">{user.name}</h1>
              <p className="meta">{user.universityEmail}</p>
              <BadgeList badges={badges} />
              <div className="profile-meta-row">
                <span>⭐ {averageRating.toFixed(1)} ({user.reviewsReceived.length} reviews)</span>
                <span>{followersCount} followers</span>
                <span>{followingCount} following</span>
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
            <span className="profile-stat-value">{activeListings.length}</span>
            <span className="profile-stat-label">Active</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{salesCount}</span>
            <span className="profile-stat-label">Sales</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{purchasesCount}</span>
            <span className="profile-stat-label">Purchases</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{savedCount}</span>
            <span className="profile-stat-label">Saved</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Main Content */}
        <div className="profile-main-col">
          {/* Active Listings */}
          <div className="detail-section">
            <div className="home-section-header" style={{ marginTop: 0 }}>
              <h2>Active Listings</h2>
              <span className="pill">{activeListings.length}</span>
            </div>
            {activeListings.length > 0 ? (
              <div className="profile-listing-grid">
                {activeListings.map((listing) => (
                  <Link key={listing.id} className="card card-hover" href={`/marketplace/${listing.id}`}>
                    {listing.images[0]?.url ? (
                      <img className="card-image" src={listing.images[0].url} alt={listing.title} loading="lazy" width={400} height={400} />
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
              <p className="meta">No active listings. <Link href="/marketplace/new" style={{ color: "var(--accent)" }}>Post one now</Link></p>
            )}
          </div>

          {/* Sold Items */}
          {soldListings.length > 0 && (
            <div className="detail-section">
              <h2>Sold Items</h2>
              <div className="profile-sold-list">
                {soldListings.map((listing) => (
                  <Link key={listing.id} className="profile-sold-item" href={`/marketplace/${listing.id}`}>
                    {listing.images[0]?.url ? (
                      <img src={listing.images[0].url} alt={listing.title} loading="lazy" />
                    ) : (
                      <div className="profile-sold-placeholder" aria-hidden="true" />
                    )}
                    <div>
                      <p style={{ fontWeight: 600 }}>{listing.title}</p>
                      <p className="meta">{formatPrice(listing.priceCents)}</p>
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
              <h2>Your Bundles</h2>
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
              <h2>Transaction History</h2>
              <div className="profile-tx-list">
                {recentTransactions.map((tx) => {
                  const isSeller = tx.sellerId === userId;
                  return (
                    <Link key={tx.id} className="profile-tx-item" href={`/marketplace/${tx.listingId}`}>
                      <div>
                        <p style={{ fontWeight: 600 }}>{tx.listing.title}</p>
                        <p className="meta">
                          {isSeller ? `Sold to ${tx.buyer.name}` : `Bought from ${tx.seller.name}`}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="price">{formatPrice(tx.priceCents)}</p>
                        <p className="meta">{formatDate(tx.completedAt)}</p>
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
            <h3>Contact Info</h3>
            <p className="meta" style={{ marginBottom: 8 }}>Add a phone number so buyers can reach you when you opt in on listings.</p>
            <PhoneForm currentPhone={user.phone} />
          </div>
          <div className="panel">
            <h3>Account</h3>
            <nav className="profile-sidebar-nav">
              <Link href="/saved">♥ Saved Items</Link>
              <Link href="/messages">💬 Messages</Link>
              <Link href="/marketplace">🔍 Browse Marketplace</Link>
            </nav>
          </div>
          <div className="panel">
            <h3>Boost your sales</h3>
            <p className="meta">
              Listings with 3+ photos sell 40% faster. Add clear images and respond within 24 hours.
            </p>
          </div>
          <div className="panel">
            <h3>Safety</h3>
            <p className="meta">
              Meet in well-lit campus locations and keep communication in UniHub chat.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
