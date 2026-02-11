import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = getCurrentUserId();
  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: { listing: { include: { images: true, user: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(saved);
}

export async function POST(request: Request) {
  const userId = getCurrentUserId();
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
}
