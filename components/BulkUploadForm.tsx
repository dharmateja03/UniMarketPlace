"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { bulkCreateListings } from "@/app/actions";

type FormState = {
  error: string | null;
};

const initialState: FormState = { error: null };

export default function BulkUploadForm() {
  const [state, formAction] = useFormState(bulkCreateListings, initialState);
  const [count, setCount] = useState(3);
  const [sharedCategory, setSharedCategory] = useState("");
  const [sharedCondition, setSharedCondition] = useState("");
  const [sharedCampus, setSharedCampus] = useState("");

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="count" value={count} />
      {state.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}

      <div className="bulk-upload-controls">
        <label htmlFor="item-count">Number of items:</label>
        <input
          id="item-count"
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
        />
        <span className="meta">Max 20 items per batch</span>
      </div>

      <div className="bulk-shared-fields">
        <h3>Shared defaults (apply to all items)</h3>
        <div className="bulk-item-grid">
          <input
            placeholder="Category (e.g., Furniture)"
            value={sharedCategory}
            onChange={(e) => setSharedCategory(e.target.value)}
          />
          <input
            placeholder="Condition (e.g., Good)"
            value={sharedCondition}
            onChange={(e) => setSharedCondition(e.target.value)}
          />
          <input
            placeholder="Campus (e.g., Main Campus)"
            value={sharedCampus}
            onChange={(e) => setSharedCampus(e.target.value)}
          />
        </div>
      </div>

      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bulk-item-card">
          <h3>Item {i + 1}</h3>
          <input
            name={`title_${i}`}
            placeholder="Title (e.g., IKEA Desk Lamp)"
            required
            minLength={4}
          />
          <textarea
            name={`description_${i}`}
            placeholder="Description (e.g., White desk lamp, works perfectly)"
            required
            minLength={10}
            rows={2}
          />
          <div className="bulk-item-grid">
            <input
              name={`price_${i}`}
              type="number"
              step="0.01"
              min={0}
              placeholder="Price ($)"
              required
            />
            <input
              name={`category_${i}`}
              placeholder="Category"
              required
              minLength={3}
              defaultValue={sharedCategory}
              key={`cat-${i}-${sharedCategory}`}
            />
            <input
              name={`condition_${i}`}
              placeholder="Condition"
              required
              minLength={3}
              defaultValue={sharedCondition}
              key={`cond-${i}-${sharedCondition}`}
            />
            <input
              name={`campus_${i}`}
              placeholder="Campus"
              required
              minLength={3}
              defaultValue={sharedCampus}
              key={`camp-${i}-${sharedCampus}`}
            />
          </div>
        </div>
      ))}

      <SubmitButton label={`Create ${count} Listing${count !== 1 ? "s" : ""}`} pendingLabel="Creating..." />
    </form>
  );
}
