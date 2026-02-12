import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(10),
  priceCents: z.number().int().nonnegative(),
  category: z.string().min(2),
  condition: z.string().min(2),
  campus: z.string().min(2),
  transactionType: z.enum(["SELL", "RENT"]),
  rentalPeriodDays: z.number().int().positive().optional().nullable(),
  flairs: z.array(z.string()).optional(),
  deliveryOptions: z.array(z.enum(["MEETUP", "DELIVERY", "PICKUP"])).optional(),
  imageUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional(),
  moveInDate: z.string().optional().nullable(),
  moveOutDate: z.string().optional().nullable(),
  furnished: z.boolean().optional().nullable(),
  roommates: z.number().int().min(0).optional().nullable(),
  petsAllowed: z.boolean().optional().nullable(),
});

export const messageSchema = z.object({
  body: z.string().min(1)
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).optional().nullable(),
  listingId: z.string().optional().nullable(),
  sellerId: z.string()
});

export const mutualReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).optional().nullable(),
  transactionId: z.string(),
});

export const reportSchema = z.object({
  reason: z.string().min(3),
  details: z.string().min(3).optional().nullable(),
  listingId: z.string()
});

export const transactionSchema = z.object({
  listingId: z.string(),
  buyerId: z.string(),
});

export const bundleSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  discountPercent: z.number().int().min(0).max(100),
  listingIds: z.array(z.string()).min(1),
});
