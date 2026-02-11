import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div>
          <p className="pill">Student-only marketplace</p>
          <h1>Buy, sell, and rent with people you actually see on campus.</h1>
          <p>
            UniHub keeps it student‑only. Post listings with photos, filter by campus,
            and chat safely — all in one place.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/marketplace">
              Explore Marketplace
            </Link>
            <Link className="button" href="/marketplace/new">
              Post a Listing
            </Link>
          </div>
          <div className="hero-highlights">
            <div>
              <p className="tag">Trust</p>
              <p className="meta">Verified university email</p>
            </div>
            <div>
              <p className="tag">Fast</p>
              <p className="meta">Post in under 2 minutes</p>
            </div>
            <div>
              <p className="tag">Local</p>
              <p className="meta">Meetups on campus</p>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-grid">
            <div className="hero-tile accent">Textbooks</div>
            <div className="hero-tile">Housing</div>
            <div className="hero-tile">Furniture</div>
            <div className="hero-tile accent-2">Electronics</div>
          </div>
          <div className="hero-card-footer">
            <div>
              <p className="tag">Today’s picks</p>
              <p className="meta">See what students are trading right now.</p>
            </div>
            <Link className="button" href="/marketplace">
              View listings
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">What Students Can Do</h2>
        <div className="card-grid">
          <div className="card">
            <p className="tag">Sell</p>
            <p>Textbooks, gadgets, furniture — list in minutes.</p>
          </div>
          <div className="card">
            <p className="tag">Rent</p>
            <p>Sublets, gear, event rentals with clear terms.</p>
          </div>
          <div className="card">
            <p className="tag">Chat</p>
            <p>Message securely without sharing phone numbers.</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">How It Works</h2>
        <div className="card-grid">
          <div className="card">
            <p className="tag">1. Verify</p>
            <p>Sign in with your university email (OAuth coming next).</p>
          </div>
          <div className="card">
            <p className="tag">2. List</p>
            <p>Add photos, choose sell or rent, and set your price.</p>
          </div>
          <div className="card">
            <p className="tag">3. Connect</p>
            <p>Chat instantly and close deals faster on campus.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
