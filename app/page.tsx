import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div>
          <p className="tag">Student-only marketplace</p>
          <h1>Buy, sell, rent — all inside your university network.</h1>
          <p>
            UniHub keeps it campus-only. Verify with your university email, list
            anything from textbooks to sublets, and chat with classmates in real time.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link className="button primary" href="/marketplace">
              Explore Listings
            </Link>
            <Link className="button" href="/marketplace/new">
              Post a Listing
            </Link>
          </div>
        </div>
        <div className="panel">
          <h3>What Students Can Do</h3>
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
        </div>
      </section>

      <section>
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
