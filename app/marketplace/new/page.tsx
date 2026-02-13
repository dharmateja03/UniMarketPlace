import NewListingForm from "@/components/NewListingForm";

export default function NewListingPage() {
  return (
    <div className="post-listing-page">
      {/* Progress Stepper */}
      <div className="post-stepper">
        <div className="post-step active">
          <div className="post-step-circle active">1</div>
          <span>Item Details</span>
        </div>
        <div className="post-step-line active" />
        <div className="post-step">
          <div className="post-step-circle">2</div>
          <span>Photos &amp; Pricing</span>
        </div>
        <div className="post-step-line" />
        <div className="post-step">
          <div className="post-step-circle">3</div>
          <span>Review</span>
        </div>
      </div>

      <div className="post-form-layout">
        <div className="panel post-form-card">
          <h1 className="post-form-title">Post a Listing</h1>
          <p className="meta" style={{ marginBottom: 20 }}>
            Tell us what you&apos;re selling so we can help you find the right buyer.
          </p>
          <NewListingForm />
        </div>
        <aside className="post-form-sidebar">
          <div className="panel">
            <h3>Posting tips</h3>
            <p className="meta">
              Use 3-6 clear photos, add pickup details, and set a fair price based on similar campus listings.
            </p>
          </div>
          <div className="panel">
            <h3>Safety</h3>
            <p className="meta">
              Meet in public campus spots and keep payment inside the app when possible.
            </p>
          </div>
          <div className="panel">
            <h3>Popular categories</h3>
            <div className="chip-row">
              <span className="chip">Electronics</span>
              <span className="chip">Books</span>
              <span className="chip">Furniture</span>
              <span className="chip">Housing</span>
              <span className="chip">Clothing</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
