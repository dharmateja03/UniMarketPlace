import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET() {
  try {
    const userId = getCurrentUserId();
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        listing: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId();

    if (isRateLimited(`${userId}:create-convo`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { listingId, sellerId, message } = body;

    if (!listingId || !sellerId) {
      return NextResponse.json({ error: "Missing listingId or sellerId" }, { status: 400 });
    }

    if (sellerId === userId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    const convo = await prisma.conversation.create({
      data: {
        listingId,
        participants: { create: [{ userId }, { userId: sellerId }] },
        messages: message ? { create: [{ senderId: userId, body: String(message).slice(0, 2000) }] } : undefined
      }
    });

    return NextResponse.json(convo, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
