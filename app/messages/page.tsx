import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export default async function MessagesPage() {
  const userId = getCurrentUserId();
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } }
    },
    include: {
      listing: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1>Messages</h1>
      <div className="card-grid">
        {conversations.map((convo) => (
          <Link key={convo.id} className="card" href={`/messages/${convo.id}`}>
            <p className="tag">{convo.listing?.title ?? "Direct chat"}</p>
            <p style={{ color: "var(--muted)" }}>
              {convo.messages[0]?.body ?? "No messages yet"}
            </p>
          </Link>
        ))}
        {!conversations.length && (
          <div className="card">
            <p>No conversations yet. Start a chat from a listing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
