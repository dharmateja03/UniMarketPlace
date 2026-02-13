import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  priceCents: z.number().int().nonnegative("Price cannot be negative."),
  category: z.string().min(3, "Category must be at least 3 characters."),
  condition: z.string().min(3, "Condition must be at least 3 characters."),
  campus: z.string().min(3, "Campus must be at least 3 characters."),
  transactionType: z.enum(["SELL", "RENT"], { errorMap: () => ({ message: "Must be Sell or Rent." }) }),
  rentalPeriodDays: z.number().int().positive("Rental period must be a positive number.").optional().nullable(),
  flairs: z.array(z.string()).optional(),
  deliveryOptions: z.array(z.enum(["MEETUP", "DELIVERY", "PICKUP"])).optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().nullable(),
  imageUrls: z.array(z.string().url("Must be a valid URL.")).optional(),
  moveInDate: z.string().optional().nullable(),
  moveOutDate: z.string().optional().nullable(),
  furnished: z.boolean().optional().nullable(),
  roommates: z.number().int().min(0, "Roommates cannot be negative.").optional().nullable(),
  petsAllowed: z.boolean().optional().nullable(),
});

export const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty.").max(2000, "Message is too long (max 2000 characters).")
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be 1-5.").max(5, "Rating must be 1-5."),
  comment: z.string().min(3, "Comment must be at least 3 characters.").max(500, "Comment is too long.").optional().nullable(),
  listingId: z.string().optional().nullable(),
  sellerId: z.string().min(1, "Seller is required.")
});

export const mutualReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be 1-5.").max(5, "Rating must be 1-5."),
  comment: z.string().min(3, "Comment must be at least 3 characters.").max(500, "Comment is too long.").optional().nullable(),
  transactionId: z.string().min(1, "Transaction is required."),
});

export const reportSchema = z.object({
  reason: z.string().min(3, "Reason must be at least 3 characters.").max(200, "Reason is too long."),
  details: z.string().min(3, "Details must be at least 3 characters.").max(1000, "Details too long.").optional().nullable(),
  listingId: z.string().min(1, "Listing is required.")
});

export const transactionSchema = z.object({
  listingId: z.string().min(1, "Listing is required."),
  buyerId: z.string().min(1, "Buyer is required."),
});

export const bundleSchema = z.object({
  title: z.string().min(3, "Bundle title must be at least 3 characters."),
  description: z.string().min(3, "Description must be at least 3 characters.").optional().nullable(),
  discountPercent: z.number().int().min(0, "Discount cannot be negative.").max(100, "Discount cannot exceed 100%."),
  listingIds: z.array(z.string()).min(1, "Select at least one listing."),
});
