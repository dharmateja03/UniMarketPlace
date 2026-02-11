import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export default async function ProfilePage() {
  const userId = getCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      listings: { include: { images: true } },
      reviewsReceived: true
    }
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  const activeListings = user.listings.length;
  const sellListings = user.listings.filter((listing) => listing.transactionType === "SELL").length;
  const rentListings = user.listings.filter((listing) => listing.transactionType === "RENT").length;
  const savedCount = await prisma.savedListing.count({ where: { userId } });
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
              <p className="meta">{user.universityEmail}</p>
              <p className="meta">Signed in as {user.email}</p>
              <p className="meta">
                Rating: {averageRating.toFixed(1)} ({user.reviewsReceived.length} reviews)
              </p>
            </div>
          </div>
          <div className="profile-actions">
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
