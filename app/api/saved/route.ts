import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET() {
  try {
    const userId = getCurrentUserId();
    const saved = await prisma.savedListing.findMany({
      where: { userId },
      include: { listing: { include: { images: true, user: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(saved);
  } catch (error) {
    console.error("GET /api/saved error:", error);
    return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId();

    if (isRateLimited(`${userId}:toggle-save`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { listingId } = body as { listingId?: string };
    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });

    if (existing) {
      await prisma.savedListing.delete({ where: { userId_listingId: { userId, listingId } } });
    } else {
      await prisma.savedListing.create({ data: { userId, listingId } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/saved error:", error);
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
  }
}
