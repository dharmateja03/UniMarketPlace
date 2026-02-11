import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
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
}

export async function POST(request: Request) {
  const body = await request.json();
  const { listingId, sellerId, message } = body;
  const userId = getCurrentUserId();

  if (!listingId || !sellerId) {
    return NextResponse.json({ error: "Missing listingId or sellerId" }, { status: 400 });
  }

  const convo = await prisma.conversation.create({
    data: {
      listingId,
      participants: { create: [{ userId }, { userId: sellerId }] },
      messages: message ? { create: [{ senderId: userId, body: String(message) }] } : undefined
    }
  });

  return NextResponse.json(convo, { status: 201 });
}
