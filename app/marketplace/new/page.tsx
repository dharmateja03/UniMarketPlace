import NewListingForm from "@/components/NewListingForm";

export default function NewListingPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Post a Listing</h1>
          <p className="meta" style={{ marginTop: 8 }}>
            Students will only see posts from verified university accounts.
          </p>
        </div>
        <div className="pill">Step 1 of 1</div>
      </div>
      <div className="form-layout">
        <div className="panel">
          <NewListingForm />
        </div>
        <aside className="side-stack">
          <div className="panel">
            <h3>Posting tips</h3>
            <p className="meta">
              Use 3–6 clear photos, add pickup details, and set a fair price based
              on similar campus listings.
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
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
