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
  imageUrl: z.string().url().optional().nullable()
});

export const messageSchema = z.object({
  body: z.string().min(1)
});
