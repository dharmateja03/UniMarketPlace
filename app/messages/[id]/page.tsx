import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { sendMessage } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

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

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const userId = getCurrentUserId();
  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_userId: { conversationId: params.id, userId }
    },
    update: { lastReadAt: new Date() },
    create: { conversationId: params.id, userId, lastReadAt: new Date() }
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      listing: { include: { images: true } },
      participants: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } }
    }
  });

  if (!conversation) {
    return <div className="detail-empty">Conversation not found.</div>;
  }

  const otherUser = conversation.participants.find((p) => p.userId !== userId)?.user;
  const action = sendMessage.bind(null, conversation.id);
  const listingImg = conversation.listing?.images?.[0]?.url;

  // Get all conversations for sidebar
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      listing: { include: { images: true } },
      participants: { include: { user: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <aside className="messages-sidebar">
        <div className="messages-sidebar-header">
          <Heading as="h1" size="5">Messages</Heading>
          <span className="pill">{conversations.length}</span>
        </div>
        <div className="messages-conv-list">
          {conversations.map((convo) => {
            const other = convo.participants.find((p) => p.userId !== userId)?.user;
            const lastMsg = convo.messages[0];
            const img = convo.listing?.images?.[0]?.url;
            const isActive = convo.id === params.id;

            return (
              <Link
                key={convo.id}
                className={`messages-conv-item${isActive ? " active" : ""}`}
                href={`/messages/${convo.id}`}
              >
                <div className="messages-conv-avatar">
                  {other?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="messages-conv-preview">
                  <div className="messages-conv-top">
                    <Text size="2" weight="medium" className="messages-conv-name">{other?.name ?? "Unknown"}</Text>
                    {lastMsg && (
                      <Text size="1" color="muted" className="messages-conv-time">{timeAgo(lastMsg.createdAt)}</Text>
                    )}
                  </div>
                  {convo.listing && (
                    <div className="messages-conv-listing">
                      {img && <img src={img} alt="" />}
                      <Text size="1" color="muted">{convo.listing.title}</Text>
                    </div>
                  )}
                  <Text as="p" size="1" color="muted" truncate className="messages-conv-snippet">
                    {lastMsg?.body ?? <Em>No messages yet</Em>}
                  </Text>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="messages-main">
        {/* Chat Header */}
        <header className="messages-chat-header">
          <div className="messages-chat-header-info">
            <div className="messages-conv-avatar">
              {otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <Heading as="h2" size="4">{otherUser?.name ?? "Unknown"}</Heading>
              <Text size="1" color="muted">{otherUser?.universityEmail}</Text>
            </div>
          </div>
          {conversation.listing && (
            <Link href={`/marketplace/${conversation.listing.id}`} className="button">
              View Listing
            </Link>
          )}
        </header>

        {/* Messages */}
        <div className="messages-chat-body">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`chat-bubble ${message.senderId === userId ? "mine" : "theirs"}`}
            >
              <div className="chat-bubble-content">
                <p>{message.body}</p>
              </div>
              <Text as="span" size="1" color="muted" className="chat-bubble-time">{formatTime(message.createdAt)}</Text>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="messages-chat-input">
          <form action={action} className="messages-chat-form">
            <label className="sr-only" htmlFor="chat-message">Message</label>
            <input
              id="chat-message"
              name="body"
              placeholder="Type a message..."
              autoComplete="off"
              required
            />
            <SubmitButton label="Send" pendingLabel="..." />
          </form>
        </div>
      </main>

      {/* Right Panel: Listing Context */}
      {conversation.listing && (
        <aside className="messages-context-panel">
          {listingImg && (
            <img
              className="messages-context-image"
              src={listingImg}
              alt={conversation.listing.title}
            />
          )}
          <div className="messages-context-body">
            <Heading as="h3" size="3">{conversation.listing.title}</Heading>
            <Text as="p" size="4" weight="bold" color="accent" className="messages-context-price">{formatPrice(conversation.listing.priceCents)}</Text>
            <Text as="p" size="1" color="muted">📍 {conversation.listing.campus}</Text>
            <Link
              href={`/marketplace/${conversation.listing.id}`}
              className="button"
              style={{ width: "100%", marginTop: 12, textAlign: "center" }}
            >
              View Listing
            </Link>
          </div>
          <div className="messages-safety-tip">
            <Strong>🛡️ Safety Tip</Strong>
            <Text as="p" size="1" color="muted">Meet in a <Em>public place on campus</Em>. Avoid exchanging money before meeting.</Text>
          </div>
        </aside>
      )}
    </div>
  );
}
