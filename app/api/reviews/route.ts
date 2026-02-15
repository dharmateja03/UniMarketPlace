import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId();

    if (isRateLimited(`${userId}:review`, 3, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    if (parsed.data.sellerId === userId) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
    }

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
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
