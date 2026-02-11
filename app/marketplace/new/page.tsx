import { createListing } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";

export default function NewListingPage() {
  return (
    <div>
      <h1>Post a Listing</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>
        Students will only see posts from verified university accounts.
      </p>
      <form action={createListing}>
        <input
          name="title"
          placeholder="Title… (e.g., Physics Textbook)"
          aria-label="Listing title"
          autoComplete="off"
          required
        />
        <textarea
          name="description"
          placeholder="Description… (e.g., Lightly used, includes notes)"
          aria-label="Listing description"
          autoComplete="off"
          required
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price… (e.g., 120.00)"
            aria-label="Price"
            autoComplete="off"
            inputMode="decimal"
            required
          />
          <select name="transactionType" aria-label="Listing type" defaultValue="SELL">
            <option value="SELL">Sell</option>
            <option value="RENT">Rent</option>
          </select>
          <input
            name="rentalPeriodDays"
            type="number"
            placeholder="Rental days… (e.g., 7)"
            aria-label="Rental period in days"
            autoComplete="off"
            inputMode="numeric"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <input
            name="category"
            placeholder="Category… (e.g., Electronics)"
            aria-label="Category"
            autoComplete="off"
            required
          />
          <input
            name="condition"
            placeholder="Condition… (e.g., Like New)"
            aria-label="Condition"
            autoComplete="off"
            required
          />
          <input
            name="campus"
            placeholder="Campus… (e.g., Main Campus)"
            aria-label="Campus"
            autoComplete="off"
            required
          />
        </div>
        <input
          name="imageUrl"
          type="url"
          placeholder="Image URL… (e.g., https://example.com/photo.jpg)"
          aria-label="Image URL"
          autoComplete="off"
        />
        <SubmitButton label="Create Listing" pendingLabel="Creating…" />
      </form>
    </div>
  );
}
