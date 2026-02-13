import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default async function MessagesPage() {
  const userId = getCurrentUserId();
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } }
    },
    include: {
      listing: { include: { images: true } },
      participants: { include: { user: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="messages-page">
      {/* Sidebar: Conversation List */}
      <aside className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h1>Messages</h1>
          <span className="pill">{conversations.length}</span>
        </div>

        <div className="messages-conv-list">
          {conversations.map((convo) => {
            const otherUser = convo.participants.find((p) => p.userId !== userId)?.user;
            const lastMessage = convo.messages[0];
            const listingImg = convo.listing?.images?.[0]?.url;

            return (
              <Link key={convo.id} className="messages-conv-item" href={`/messages/${convo.id}`}>
                <div className="messages-conv-avatar">
                  {otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="messages-conv-preview">
                  <div className="messages-conv-top">
                    <span className="messages-conv-name">{otherUser?.name ?? "Unknown"}</span>
                    {lastMessage && (
                      <span className="messages-conv-time">{timeAgo(lastMessage.createdAt)}</span>
                    )}
                  </div>
                  {convo.listing && (
                    <div className="messages-conv-listing">
                      {listingImg && <img src={listingImg} alt="" />}
                      <span>{convo.listing.title}</span>
                    </div>
                  )}
                  <p className="messages-conv-snippet">
                    {lastMessage?.body ?? "No messages yet"}
                  </p>
                </div>
              </Link>
            );
          })}

          {!conversations.length && (
            <div className="messages-empty">
              <p>No conversations yet.</p>
              <Link className="button" href="/marketplace">Browse listings</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main area: placeholder when no convo selected */}
      <main className="messages-main">
        <div className="messages-main-empty">
          <p style={{ fontSize: "2rem", marginBottom: 8 }}>💬</p>
          <h2>Select a conversation</h2>
          <p className="meta">Choose a chat from the left to start messaging.</p>
        </div>
      </main>
    </div>
  );
}
