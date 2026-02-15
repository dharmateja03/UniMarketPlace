import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Text, Heading, Em } from "@/components/ui/typography";

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
          <Heading as="h1" size="5">Messages</Heading>
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
                    <Text size="2" weight="medium" className="messages-conv-name">{otherUser?.name ?? "Unknown"}</Text>
                    {lastMessage && (
                      <Text size="1" color="muted" className="messages-conv-time">{timeAgo(lastMessage.createdAt)}</Text>
                    )}
                  </div>
                  {convo.listing && (
                    <div className="messages-conv-listing">
                      {listingImg && <img src={listingImg} alt="" />}
                      <Text size="1" color="muted">{convo.listing.title}</Text>
                    </div>
                  )}
                  <Text as="p" size="1" color="muted" truncate className="messages-conv-snippet">
                    {lastMessage?.body ?? <Em>No messages yet</Em>}
                  </Text>
                </div>
              </Link>
            );
          })}

          {!conversations.length && (
            <div className="messages-empty">
              <Text as="p" size="2" color="muted">No conversations yet.</Text>
              <Link className="button" href="/marketplace">Browse listings</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main area: placeholder when no convo selected */}
      <main className="messages-main">
        <div className="messages-main-empty">
          <p style={{ fontSize: "2rem", marginBottom: 8 }}>💬</p>
          <Heading as="h2" size="5">Select a conversation</Heading>
          <Text as="p" size="2" color="muted">Choose a chat from the left to start messaging.</Text>
        </div>
      </main>
    </div>
  );
}
