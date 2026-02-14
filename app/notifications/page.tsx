import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function NotificationsPage() {
  const userId = getCurrentUserId();

  // Get recent messages (as notifications)
  const recentMessages = await prisma.message.findMany({
    where: {
      conversation: { participants: { some: { userId } } },
      senderId: { not: userId },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      sender: true,
      conversation: { include: { listing: { select: { id: true, title: true } } } },
    },
  });

  // Get recent offers on your listings
  const recentOffers = await prisma.offer.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      buyer: true,
      listing: { select: { id: true, title: true } },
    },
  });

  // Get recent reviews on your listings
  const recentReviews = await prisma.review.findMany({
    where: { sellerId: userId, reviewerId: { not: userId } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      reviewer: true,
      listing: { select: { id: true, title: true } },
    },
  });

  // Combine and sort by date
  type NotifItem = {
    id: string;
    type: "message" | "offer" | "review";
    icon: string;
    title: string;
    body: string;
    href: string;
    time: Date;
  };

  const notifications: NotifItem[] = [
    ...recentMessages.map((msg) => ({
      id: `msg-${msg.id}`,
      type: "message" as const,
      icon: "💬",
      title: `New message from ${msg.sender.name}`,
      body: msg.body.length > 80 ? msg.body.slice(0, 80) + "..." : msg.body,
      href: `/messages/${msg.conversationId}`,
      time: msg.createdAt,
    })),
    ...recentOffers.map((offer) => ({
      id: `offer-${offer.id}`,
      type: "offer" as const,
      icon: "💰",
      title: `${offer.buyer.name} made an offer`,
      body: `$${(offer.amountCents / 100).toFixed(2)} on "${offer.listing.title}"`,
      href: `/marketplace/${offer.listingId}`,
      time: offer.createdAt,
    })),
    ...recentReviews.map((review) => ({
      id: `review-${review.id}`,
      type: "review" as const,
      icon: "⭐",
      title: `${review.reviewer.name} left a review`,
      body: `${review.rating}/5${review.comment ? ` — "${review.comment.slice(0, 60)}"` : ""}`,
      href: review.listing ? `/marketplace/${review.listing.id}` : "/profile",
      time: review.createdAt,
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h1>Notifications</h1>
        <p className="meta">{notifications.length} recent updates</p>
      </div>

      {notifications.length > 0 ? (
        <div className="notif-list">
          {notifications.map((notif) => (
            <Link key={notif.id} href={notif.href} className="notif-item">
              <span className="notif-icon">{notif.icon}</span>
              <div className="notif-content">
                <p className="notif-title">{notif.title}</p>
                <p className="notif-body">{notif.body}</p>
              </div>
              <span className="notif-time">{timeAgo(notif.time)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="notif-empty">
          <p style={{ fontSize: "2rem", marginBottom: 8 }}>🔔</p>
          <h2>No notifications yet</h2>
          <p className="meta">When you receive messages, offers, or reviews they will appear here.</p>
          <Link className="button primary" href="/marketplace" style={{ marginTop: 16 }}>
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
