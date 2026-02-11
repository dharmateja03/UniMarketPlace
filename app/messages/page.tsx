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
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p className="meta" style={{ marginTop: 8 }}>
            Reply quickly to close deals faster.
          </p>
        </div>
        <Link className="button" href="/marketplace">
          Find listings
        </Link>
      </div>

      <div className="messages-layout">
        <section className="panel">
          <div className="message-header">
            <h3>Inbox</h3>
            <span className="pill">{conversations.length} chats</span>
          </div>
          <div className="message-list">
            {conversations.map((convo) => (
              <Link key={convo.id} className="message-row" href={`/messages/${convo.id}`}>
                <div className="message-avatar">{convo.listing?.title?.slice(0, 1) ?? "C"}</div>
                <div className="message-preview">
                  <p className="tag">{convo.listing?.title ?? "Direct chat"}</p>
                  <p className="meta">
                    {convo.messages[0]?.body ?? "No messages yet"}
                  </p>
                </div>
                <span className="pill subtle">Open</span>
              </Link>
            ))}
            {!conversations.length && (
              <div className="empty-state">
                <p>No conversations yet. Start a chat from a listing.</p>
                <Link className="button" href="/marketplace">
                  Browse listings
                </Link>
              </div>
            )}
          </div>
        </section>
        <aside className="side-stack">
          <div className="panel">
            <h3>Tips for faster replies</h3>
            <p className="meta">
              Share your availability and preferred meeting location in your first message.
            </p>
          </div>
          <div className="panel">
            <h3>Stay safe</h3>
            <p className="meta">
              Keep your conversation in UniHub and meet in well-lit campus locations.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
