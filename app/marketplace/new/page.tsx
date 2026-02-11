import { createListing } from "@/app/actions";

export default function NewListingPage() {
  return (
    <div>
      <h1>Post a listing</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>
        Students will only see posts from verified university accounts.
      </p>
      <form action={createListing}>
        <input name="title" placeholder="Title" required />
        <textarea name="description" placeholder="Description" required />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <input name="price" type="number" step="0.01" placeholder="Price" required />
          <select name="transactionType" defaultValue="SELL">
            <option value="SELL">Sell</option>
            <option value="RENT">Rent</option>
          </select>
          <input name="rentalPeriodDays" type="number" placeholder="Rental days (optional)" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <input name="category" placeholder="Category" required />
          <input name="condition" placeholder="Condition" required />
          <input name="campus" placeholder="Campus" required />
        </div>
        <input name="imageUrl" placeholder="Image URL (optional)" />
        <button className="button primary" type="submit">Create Listing</button>
      </form>
    </div>
  );
}
