import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { listingSchema } from "@/lib/validators";
import { isRateLimited } from "@/lib/rate-limit";

function parseNumber(value: string | null) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const campus = searchParams.get("campus")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "";
    const min = parseNumber(searchParams.get("min"));
    const max = parseNumber(searchParams.get("max"));

    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, user: true },
      take: 100,
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } }
                ]
              }
            : {},
          category && category !== "all" ? { category } : {},
          campus && campus !== "all" ? { campus } : {},
          type && type !== "all" ? { transactionType: type as "SELL" | "RENT" } : {},
          min !== null ? { priceCents: { gte: Math.round(min * 100) } } : {},
          max !== null ? { priceCents: { lte: Math.round(max * 100) } } : {}
        ]
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId();

    if (isRateLimited(`${userId}:create-listing`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = listingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceCents: parsed.data.priceCents,
        category: parsed.data.category,
        condition: parsed.data.condition,
        campus: parsed.data.campus,
        transactionType: parsed.data.transactionType,
        rentalPeriodDays: parsed.data.rentalPeriodDays ?? null,
        deliveryOptions: parsed.data.deliveryOptions ?? ["MEETUP"],
        userId,
        images:
          parsed.data.imageUrls?.length || parsed.data.imageUrl
            ? {
                create: [
                  ...(parsed.data.imageUrls ?? []).map((url) => ({ url })),
                  ...(parsed.data.imageUrl ? [{ url: parsed.data.imageUrl }] : [])
                ]
              }
            : undefined
      }
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
