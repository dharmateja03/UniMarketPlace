import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { messageSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    include: { sender: true },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const userId = getCurrentUserId();
  const message = await prisma.message.create({
    data: {
      conversationId: params.id,
      senderId: userId,
      body: parsed.data.body
    }
  });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId: params.id, userId },
    data: { lastReadAt: new Date() }
  });

  return NextResponse.json(message, { status: 201 });
}
