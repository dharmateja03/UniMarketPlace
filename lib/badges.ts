import { prisma } from "@/lib/db";

export type Badge = {
  key: string;
  label: string;
  icon: string;
};

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const badges: Badge[] = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVerified: true, universityEmail: true },
  });

  if (!user) return badges;

  if (user.isVerified || user.universityEmail) {
    badges.push({ key: "verified", label: "Verified Student", icon: "\u2713" });
  }

  const salesCount = await prisma.transaction.count({
    where: { sellerId: userId },
  });
  if (salesCount >= 5) {
    badges.push({ key: "trusted", label: "Trusted Seller", icon: "\u2605" });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 10 },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  let totalResponseMs = 0;
  let responseCount = 0;

  for (const convo of conversations) {
    const msgs = convo.messages;
    for (let i = 1; i < msgs.length; i++) {
      if (msgs[i].senderId === userId && msgs[i - 1].senderId !== userId) {
        totalResponseMs += msgs[i].createdAt.getTime() - msgs[i - 1].createdAt.getTime();
        responseCount++;
        break;
      }
    }
  }

  if (responseCount > 0 && totalResponseMs / responseCount < 60 * 60 * 1000) {
    badges.push({ key: "quick", label: "Quick Responder", icon: "\u26A1" });
  }

  return badges;
}
