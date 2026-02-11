"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let alive = true;

    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications/unread", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (alive) {
          setUnreadCount(Number(data.unreadCount) || 0);
        }
      } catch {
        // ignore polling errors in dev
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header>
      <Link href="/">
        <strong>UniHub</strong>
      </Link>
      <nav>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/messages">
          Messages
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </Link>
        <Link href="/profile">Profile</Link>
        <Link className="nav-accent" href="/marketplace/new">
          Post Listing
        </Link>
      </nav>
    </header>
  );
}
