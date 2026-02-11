import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = getCurrentUserId();
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true }
  });

  if (!participants.length) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const counts = await Promise.all(
    participants.map((participant) =>
      prisma.message.count({
        where: {
          conversationId: participant.conversationId,
          senderId: { not: userId },
          createdAt: participant.lastReadAt
            ? { gt: participant.lastReadAt }
            : undefined
        }
      })
    )
  );

  const unreadCount = counts.reduce((sum, value) => sum + value, 0);
  return NextResponse.json({ unreadCount });
}
