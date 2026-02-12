"use client";

import { useFormState } from "react-dom";
import SubmitButton from "@/components/SubmitButton";
import { createBundleAction } from "@/app/actions";

type FormState = { error: string | null };
const initialState: FormState = { error: null };

type ListingOption = {
  id: string;
  title: string;
};

export default function NewBundleForm({ listings }: { listings: ListingOption[] }) {
  const [state, formAction] = useFormState(createBundleAction, initialState);

  return (
    <form action={formAction} noValidate>
      {state.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}
      <label className="sr-only" htmlFor="bundle-title">Bundle title</label>
      <input
        id="bundle-title"
        name="title"
        placeholder="Bundle title\u2026 (e.g., Moving Out Sale)"
        autoComplete="off"
        required
        minLength={3}
      />
      <label className="sr-only" htmlFor="bundle-description">Description</label>
      <textarea
        id="bundle-description"
        name="description"
        placeholder="Description (optional)"
        autoComplete="off"
      />
      <label className="sr-only" htmlFor="bundle-discount">Discount percent</label>
      <input
        id="bundle-discount"
        name="discountPercent"
        type="number"
        min={0}
        max={100}
        defaultValue={0}
        placeholder="Discount % (e.g., 15)"
        autoComplete="off"
      />
      <fieldset className="choice-grid">
        <legend>Select listings for this bundle</legend>
        {listings.map((listing) => (
          <label key={listing.id}>
            <input type="checkbox" name="listingIds" value={listing.id} />
            {listing.title}
          </label>
        ))}
        {!listings.length && <p className="meta">No available listings to bundle.</p>}
      </fieldset>
      <SubmitButton label="Create Bundle" pendingLabel="Creating\u2026" />
    </form>
  );
}
