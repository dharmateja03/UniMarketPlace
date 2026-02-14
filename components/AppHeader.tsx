"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

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
      <Link href="/" className="header-logo">
        <strong>UniHub</strong>
      </Link>
      <form className="header-search" action="/marketplace" method="get">
        <span className="header-search-icon" aria-hidden="true">🔍</span>
        <input
          name="q"
          placeholder="Search for textbooks, furniture, bikes..."
          autoComplete="off"
          type="search"
        />
      </form>
      <nav>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/saved">Saved</Link>
        <Link href="/messages">
          Messages
          {unreadCount > 0 && (
            <span className="badge" aria-live="polite" aria-atomic="true">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/notifications" className="header-notif-btn" aria-label="Notifications">
          <span className="header-notif-icon">🔔</span>
          {unreadCount > 0 && (
            <span className="header-notif-badge">{unreadCount}</span>
          )}
        </Link>
        <Link href="/profile">Profile</Link>
        <ThemeToggle />
        <Link className="nav-accent" href="/marketplace/new">
          + Sell
        </Link>
      </nav>
    </header>
  );
}
