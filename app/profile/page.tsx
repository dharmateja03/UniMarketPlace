import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBadges } from "@/lib/badges";
import BadgeList from "@/components/BadgeList";

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
      listings: { include: { images: true } },
      reviewsReceived: true,
      bundles: { include: { listings: { include: { images: true } } } },
    }
  });

  if (!user) {
    return <div>User not found.</div>;
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

  const activeListings = user.listings.length;
  const sellListings = user.listings.filter((listing) => listing.transactionType === "SELL").length;
  const rentListings = user.listings.filter((listing) => listing.transactionType === "RENT").length;
  const averageRating =
    user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
        user.reviewsReceived.length
      : 0;

  return (
    <div>
      <div className="profile-hero">
        <div className="profile-card">
          <div className="profile-main">
            <div className="profile-avatar">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt={user.name} />
              ) : (
                <span>{user.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="tag">Student profile</p>
              <h1>{user.name}</h1>
              <BadgeList badges={badges} />
              <p className="meta">{user.universityEmail}</p>
              <p className="meta">Signed in as {user.email}</p>
              <p className="meta">
                Rating: {averageRating.toFixed(1)} ({user.reviewsReceived.length} reviews)
              </p>
              <p className="meta">
                {followersCount} followers \u00B7 {followingCount} following
              </p>
            </div>
          </div>
          <div className="profile-actions">
            <Link className="button" href="/bundles/new">Create Bundle</Link>
            <button className="button">Edit Profile</button>
            <button className="button primary">Sign Out</button>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-card">
            <p className="tag">Active</p>
            <h2>{activeListings}</h2>
            <p className="meta">Total listings</p>
          </div>
          <div className="stat-card">
            <p className="tag">Sell</p>
            <h2>{sellListings}</h2>
            <p className="meta">Buy & sell posts</p>
          </div>
          <div className="stat-card">
            <p className="tag">Rent</p>
            <h2>{rentListings}</h2>
            <p className="meta">Rental posts</p>
          </div>
          <div className="stat-card">
            <p className="tag">Saved</p>
            <h2>{savedCount}</h2>
            <p className="meta">Saved items</p>
          </div>
          <div className="stat-card">
            <p className="tag">Sales</p>
            <h2>{salesCount}</h2>
            <p className="meta">Completed sales</p>
          </div>
          <div className="stat-card">
            <p className="tag">Purchases</p>
            <h2>{purchasesCount}</h2>
            <p className="meta">Items bought</p>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <section>
          <h2 className="section-title">Your Listings</h2>
          <div className="card-grid">
            {user.listings.map((listing) => (
              <Link className="card card-hover" key={listing.id} href={`/marketplace/${listing.id}`}>
                {listing.images[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="card-image" src={listing.images[0].url} alt={listing.title} />
                ) : (
                  <div className="card-image placeholder" aria-hidden="true" />
                )}
                <div className="card-body">
                  <p className="tag">{listing.transactionType}</p>
                  <h3>{listing.title}</h3>
                  <p className="meta">{listing.campus}</p>
                  <p className="meta">Status: {listing.status}</p>
                </div>
              </Link>
            ))}
            {!user.listings.length && (
              <div className="card">
                <p>You have not posted a listing yet.</p>
              </div>
            )}
          </div>

          {/* Bundles */}
          {user.bundles.length > 0 && (
            <>
              <h2 className="section-title">Your Bundles</h2>
              <div className="card-grid">
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
            </>
          )}

          {/* Transaction History */}
          {recentTransactions.length > 0 && (
            <>
              <h2 className="section-title">Transaction History</h2>
              <div className="transaction-list">
                {recentTransactions.map((tx) => {
                  const isSeller = tx.sellerId === userId;
                  return (
                    <Link key={tx.id} className="transaction-item" href={`/marketplace/${tx.listingId}`}>
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
            </>
          )}
        </section>

        <aside className="profile-side">
          <div className="panel">
            <h3>Marketplace Tips</h3>
            <p className="meta">
              Listings with 3+ photos sell 40% faster. Add clear images, set fair pricing, and respond within 24 hours.
            </p>
          </div>
          <div className="panel">
            <h3>Safety</h3>
            <p className="meta">
              Meet in well-lit campus locations, confirm university emails, and keep communication in UniHub chat.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
