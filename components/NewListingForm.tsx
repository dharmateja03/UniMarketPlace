"use client";

import { useFormState } from "react-dom";
import { useMemo, useState } from "react";
import { createListingAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormCheckbox } from "@/components/ui/checkbox";
import { FormSwitch } from "@/components/ui/switch";
import { UploadIcon, ImageIcon, Cross2Icon, ExclamationTriangleIcon, UpdateIcon } from "@radix-ui/react-icons";

type FormState = { error: string | null };
const initialState: FormState = { error: null };

const FLAIRS = [
  "Brand New",
  "Under a Year Old",
  "Must Go ASAP",
  "Price Negotiable",
  "Barely Used",
  "Like New",
  "Final Price",
];

export default function NewListingForm() {
  const [state, formAction] = useFormState(createListingAction, initialState);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showHousing, setShowHousing] = useState(false);
  const [isRent, setIsRent] = useState(false);

  const previewUrls = useMemo(() => imageUrls, [imageUrls]);

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const signRes = await fetch("/api/uploads/r2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload URL.");
      const { uploadUrl, publicUrl } = (await signRes.json()) as { uploadUrl: string; publicUrl: string };
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("Upload failed.");
      setImageUrls((prev) => [...prev, publicUrl]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {/* Error banner */}
      {state.error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 [data-theme='dark']:bg-red-950/30 [data-theme='dark']:border-red-900 [data-theme='dark']:text-red-400" role="alert">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* ── Basic Info ── */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="listing-title">Title</Label>
          <Input
            id="listing-title"
            name="title"
            placeholder="e.g., Physics Textbook — 8th Edition"
            autoComplete="off"
            required
            minLength={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="listing-description">Description</Label>
          <Textarea
            id="listing-description"
            name="description"
            placeholder="Describe condition, reason for selling, pickup details..."
            autoComplete="off"
            required
            minLength={10}
          />
        </div>
      </div>

      {/* ── Pricing & Type ── */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">💲</span> Pricing &amp; Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="listing-price">Price (USD)</Label>
            <Input
              id="listing-price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              autoComplete="off"
              inputMode="decimal"
              required
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-type">Listing Type</Label>
            <Select
              id="listing-type"
              name="transactionType"
              defaultValue="SELL"
              onChange={(e) => setIsRent(e.target.value === "RENT")}
            >
              <option value="SELL">Sell</option>
              <option value="RENT">Rent</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rental-days" className={!isRent ? "text-muted-foreground" : ""}>
              Rental Period (days)
            </Label>
            <Input
              id="rental-days"
              name="rentalPeriodDays"
              type="number"
              placeholder="e.g., 30"
              autoComplete="off"
              inputMode="numeric"
              min={1}
              disabled={!isRent}
              className={!isRent ? "opacity-40" : ""}
            />
          </div>
        </div>
      </div>

      {/* ── Discount / Sale ── */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">🏷️</span> Sale / Discount
          <span className="text-xs font-normal text-muted-foreground">Optional</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="discount-percent">Discount %</Label>
            <Input
              id="discount-percent"
              name="discountPercent"
              type="number"
              min={0}
              max={99}
              placeholder="e.g., 20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale-ends">Sale Ends</Label>
            <Input
              id="sale-ends"
              name="saleEndsAt"
              type="datetime-local"
            />
          </div>
        </div>
      </div>

      {/* ── Flairs ── */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">✨</span> Flairs
        </h3>
        <p className="text-xs text-muted-foreground">Select tags that describe your item</p>
        <div className="flex flex-wrap gap-2">
          {FLAIRS.map((flair) => (
            <label key={flair} className="group cursor-pointer">
              <input type="checkbox" name="flairs" value={flair} className="peer sr-only" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-all peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent hover:border-accent/50">
                {flair}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Delivery ── */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">📦</span> Delivery Preferences
        </h3>
        <div className="space-y-3">
          <FormCheckbox name="deliveryOptions" value="MEETUP" defaultChecked label="Meet on campus" />
          <FormCheckbox name="deliveryOptions" value="PICKUP" label="Pickup only" />
          <FormCheckbox name="deliveryOptions" value="DELIVERY" label="Local delivery" />
        </div>
      </div>

      {/* ── Category & Location ── */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">📍</span> Category &amp; Location
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="listing-category">Category</Label>
            <Input
              id="listing-category"
              name="category"
              placeholder="e.g., Electronics"
              autoComplete="off"
              required
              minLength={2}
              onChange={(e) => setShowHousing(e.target.value.toLowerCase() === "housing")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-condition">Condition</Label>
            <Input
              id="listing-condition"
              name="condition"
              placeholder="e.g., Like New"
              autoComplete="off"
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-campus">Campus</Label>
            <Input
              id="listing-campus"
              name="campus"
              placeholder="e.g., Main Campus"
              autoComplete="off"
              required
              minLength={2}
            />
          </div>
        </div>
      </div>

      {/* ── Housing Details (conditional) ── */}
      {showHousing && (
        <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-base">🏠</span> Housing Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="move-in">Move-in Date</Label>
              <Input id="move-in" name="moveInDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="move-out">Move-out Date</Label>
              <Input id="move-out" name="moveOutDate" type="date" />
            </div>
          </div>
          <div className="space-y-3 pt-1">
            <FormSwitch name="furnished" value="true" label="Furnished" description="Includes furniture and basics" />
            <FormSwitch name="petsAllowed" value="true" label="Pets Allowed" description="Open to pet-owning tenants" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roommates-count">Roommates</Label>
            <Input id="roommates-count" name="roommates" type="number" min={0} placeholder="Number of roommates" className="max-w-[200px]" />
          </div>
        </div>
      )}

      {/* ── Contact Info ── */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">📞</span> Contact Info
          <span className="text-xs font-normal text-muted-foreground">Optional</span>
        </h3>
        <p className="text-xs text-muted-foreground">Let buyers reach you directly. Your info from your profile will be shown on this listing.</p>
        <div className="space-y-3 pt-1">
          <FormSwitch name="showEmail" value="true" label="Show my email" description="Buyers can see your email address" />
          <FormSwitch name="showPhone" value="true" label="Show my phone number" description="Buyers can call or text you" />
        </div>
      </div>

      {/* ── Photos ── */}
      {imageUrls.map((url) => (
        <input key={url} type="hidden" name="imageUrls" value={url} />
      ))}
      <div className="rounded-lg border-2 border-dashed border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-base">📸</span> Photos
          </h3>
          <span className="text-xs text-muted-foreground">{imageUrls.length}/6 uploaded</span>
        </div>

        <label className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer rounded-lg border border-border bg-background hover:bg-accent/5 hover:border-accent/30 transition-all group">
          <div className="rounded-full bg-accent/10 p-3 group-hover:bg-accent/20 transition-colors">
            {uploading ? (
              <UpdateIcon className="h-6 w-6 text-accent animate-spin" />
            ) : (
              <ImageIcon className="h-6 w-6 text-accent" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {uploading ? "Uploading..." : "Click to upload photos"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
          </div>
          <input
            id="listing-image"
            name="imageFile"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
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
        </label>

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-red-600" role="alert">
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {previewUrls.map((url) => (
              <div key={url} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <Cross2Icon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        className="w-full h-12 rounded-lg bg-accent text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        Create Listing
      </button>
    </form>
  );
}
