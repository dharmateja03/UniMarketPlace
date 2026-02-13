import Link from "next/link";

export default function ListingSuccessPage() {
  return (
    <div className="listing-success-page">
      <div className="listing-success-card">
        {/* Decorative gradient */}
        <div className="listing-success-glow" aria-hidden="true" />

        {/* Success icon */}
        <div className="listing-success-icon">
          <span>✓</span>
        </div>

        <h1>Listing Published!</h1>
        <p className="meta" style={{ maxWidth: 320, margin: "0 auto 24px" }}>
          Your item is now live for students on campus to see.
        </p>

        {/* Action buttons */}
        <div className="listing-success-actions">
          <Link className="button primary" href="/marketplace">
            Browse Marketplace
          </Link>
          <Link className="button" href="/profile">
            View My Listings
          </Link>
          <Link className="button" href="/marketplace/new">
            Post Another Item
          </Link>
        </div>

        {/* Tip */}
        <div className="listing-success-tip">
          <strong>💡 Did you know?</strong>
          <p className="meta">Items shared on social media sell 3x faster on average!</p>
        </div>
      </div>
    </div>
  );
}
