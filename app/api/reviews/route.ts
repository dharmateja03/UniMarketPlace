import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const userId = getCurrentUserId();
  const review = await prisma.review.create({
    data: {
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
      listingId: parsed.data.listingId ?? null,
      sellerId: parsed.data.sellerId,
      reviewerId: userId
    }
  });

  return NextResponse.json(review, { status: 201 });
}
