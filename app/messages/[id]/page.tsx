import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { sendMessage } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";

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
      listing: true,
      participants: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } }
    }
  });

  if (!conversation) {
    return <div>Conversation not found.</div>;
  }

  const action = sendMessage.bind(null, conversation.id);

  return (
    <div>
      <h1>Chat</h1>
      <p style={{ color: "var(--muted)" }}>
        {conversation.listing?.title ?? "General conversation"}
      </p>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="message-list">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.senderId === userId ? "mine" : ""}`}
            >
              <strong>{message.sender.name}</strong>
              <p>{message.body}</p>
            </div>
          ))}
        </div>
        <form action={action}>
          <label className="sr-only" htmlFor="chat-message">
            Message
          </label>
          <input
            id="chat-message"
            name="body"
            placeholder="Type a message… (e.g., I can meet after class)"
            autoComplete="off"
            required
          />
          <SubmitButton label="Send Message" pendingLabel="Sending…" />
        </form>
      </div>
    </div>
  );
}
