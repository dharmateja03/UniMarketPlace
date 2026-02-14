"use client";

import { useFormState } from "react-dom";
import { useMemo, useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createListingAction } from "@/app/actions";

type FormState = {
  error: string | null;
};

const initialState: FormState = { error: null };

export default function NewListingForm() {
  const [state, formAction] = useFormState(createListingAction, initialState);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showHousing, setShowHousing] = useState(false);

  const previewUrls = useMemo(() => imageUrls, [imageUrls]);

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      const signRes = await fetch("/api/uploads/r2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });

      if (!signRes.ok) {
        throw new Error("Failed to get upload URL.");
      }

      const { uploadUrl, publicUrl } = (await signRes.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed.");
      }

      setImageUrls((prev) => [...prev, publicUrl]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} noValidate>
      {state.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}
      <label className="sr-only" htmlFor="listing-title">
        Listing title
      </label>
      <input
        id="listing-title"
        name="title"
        placeholder="Title… (e.g., Physics Textbook)"
        autoComplete="off"
        required
        minLength={4}
      />
      <label className="sr-only" htmlFor="listing-description">
        Listing description
      </label>
      <textarea
        id="listing-description"
        name="description"
        placeholder="Description… (e.g., Lightly used, includes notes)"
        autoComplete="off"
        required
        minLength={10}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <label className="sr-only" htmlFor="listing-price">
          Price
        </label>
        <input
          id="listing-price"
          name="price"
          type="number"
          step="0.01"
          placeholder="Price… (e.g., 120.00)"
          autoComplete="off"
          inputMode="decimal"
          required
          min={0}
        />
        <label className="sr-only" htmlFor="listing-type">
          Listing type
        </label>
      <select
        id="listing-type"
        name="transactionType"
        defaultValue="SELL"
        onChange={(event) => {
          const rentalInput = document.getElementById("rental-days") as HTMLInputElement | null;
          if (!rentalInput) return;
          rentalInput.disabled = event.target.value !== "RENT";
          if (event.target.value !== "RENT") {
            rentalInput.value = "";
          }
        }}
      >
        <option value="SELL">Sell</option>
        <option value="RENT">Rent</option>
      </select>
        <label className="sr-only" htmlFor="rental-days">
          Rental period in days
        </label>
      <input
        id="rental-days"
        name="rentalPeriodDays"
        type="number"
        placeholder="Rental days… (e.g., 7)"
        autoComplete="off"
        inputMode="numeric"
        min={1}
        disabled
      />
      </div>
      <fieldset className="choice-grid">
        <legend>Sale / Discount (optional)</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label htmlFor="discount-percent" style={{ fontWeight: 500, fontSize: "0.9rem" }}>Discount %</label>
            <input
              id="discount-percent"
              name="discountPercent"
              type="number"
              min={0}
              max={99}
              placeholder="e.g., 20"
            />
          </div>
          <div>
            <label htmlFor="sale-ends" style={{ fontWeight: 500, fontSize: "0.9rem" }}>Sale ends</label>
            <input
              id="sale-ends"
              name="saleEndsAt"
              type="datetime-local"
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="flair-grid">
        <legend>Add flairs</legend>
        <label><input type="checkbox" name="flairs" value="Brand New" /> Brand New</label>
        <label><input type="checkbox" name="flairs" value="Under a Year Old" /> Under a Year Old</label>
        <label><input type="checkbox" name="flairs" value="Must Go ASAP" /> Must Go ASAP</label>
        <label><input type="checkbox" name="flairs" value="Price Negotiable" /> Price Negotiable</label>
        <label><input type="checkbox" name="flairs" value="Barely Used" /> Barely Used</label>
        <label><input type="checkbox" name="flairs" value="Like New" /> Like New</label>
        <label><input type="checkbox" name="flairs" value="Final Price" /> Final Price</label>
      </fieldset>
      <fieldset className="choice-grid">
        <legend>Delivery preferences</legend>
        <label>
          <input type="checkbox" name="deliveryOptions" value="MEETUP" defaultChecked />
          Meet on campus
        </label>
        <label>
          <input type="checkbox" name="deliveryOptions" value="PICKUP" />
          Pickup only
        </label>
        <label>
          <input type="checkbox" name="deliveryOptions" value="DELIVERY" />
          Local delivery
        </label>
      </fieldset>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <label className="sr-only" htmlFor="listing-category">
          Category
        </label>
        <input
          id="listing-category"
          name="category"
          placeholder="Category\u2026 (e.g., Electronics)"
          autoComplete="off"
          required
          minLength={2}
          onChange={(e) => setShowHousing(e.target.value.toLowerCase() === "housing")}
        />
        <label className="sr-only" htmlFor="listing-condition">
          Condition
        </label>
        <input
          id="listing-condition"
          name="condition"
          placeholder="Condition… (e.g., Like New)"
          autoComplete="off"
          required
          minLength={2}
        />
        <label className="sr-only" htmlFor="listing-campus">
          Campus
        </label>
        <input
          id="listing-campus"
          name="campus"
          placeholder="Campus… (e.g., Main Campus)"
          autoComplete="off"
          required
          minLength={2}
        />
      </div>
      {showHousing && (
        <fieldset className="housing-fields">
          <legend>Housing Details</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label htmlFor="move-in" style={{ fontWeight: 500, fontSize: "0.9rem" }}>Move-in date</label>
              <input id="move-in" name="moveInDate" type="date" />
            </div>
            <div>
              <label htmlFor="move-out" style={{ fontWeight: 500, fontSize: "0.9rem" }}>Move-out date</label>
              <input id="move-out" name="moveOutDate" type="date" />
            </div>
          </div>
          <label>
            <input type="checkbox" name="furnished" value="true" />
            Furnished
          </label>
          <label>
            <input type="checkbox" name="petsAllowed" value="true" />
            Pets allowed
          </label>
          <div>
            <label htmlFor="roommates-count" style={{ fontWeight: 500, fontSize: "0.9rem" }}>Roommates</label>
            <input id="roommates-count" name="roommates" type="number" min={0} placeholder="Number of roommates" />
          </div>
        </fieldset>
      )}
      <fieldset className="choice-grid">
        <legend>Contact info (optional)</legend>
        <p className="meta" style={{ marginBottom: 4 }}>Let buyers reach you directly. Your info from your profile will be shown.</p>
        <label>
          <input type="checkbox" name="showEmail" value="true" />
          Show my email on this listing
        </label>
        <label>
          <input type="checkbox" name="showPhone" value="true" />
          Show my phone number on this listing
        </label>
      </fieldset>
      <label className="sr-only" htmlFor="listing-image">
        Images
      </label>
      {imageUrls.map((url) => (
        <input key={url} type="hidden" name="imageUrls" value={url} />
      ))}
      <div className="upload-panel">
        <div>
          <p style={{ fontWeight: 600 }}>Listing photo</p>
          <p className="meta">Upload up to 6 photos for better reach.</p>
        </div>
        <input
          id="listing-image"
          name="imageFile"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (!files.length) return;
            if (imageUrls.length + files.length > 6) {
              setUploadError("You can upload up to 6 images.");
              return;
            }
            files.forEach((file) => {
              if (file.size > 5 * 1024 * 1024) {
                setUploadError("Max file size is 5MB.");
                return;
              }
              void handleUpload(file);
            });
          }}
        />
      </div>
      {uploading && <p className="meta">Uploading image…</p>}
      {uploadError && (
        <div className="form-error" role="alert">
          {uploadError}
        </div>
      )}
      {previewUrls.length > 0 && (
        <div className="upload-preview-grid">
          {previewUrls.map((url) => (
            <img key={url} src={url} alt="Listing preview" />
          ))}
        </div>
      )}
      <SubmitButton label="Create Listing" pendingLabel="Creating…" />
    </form>
  );
}
