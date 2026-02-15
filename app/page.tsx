import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const categoryIcons: Record<string, string> = {
  Electronics: "\u{1F4BB}",
  Housing: "\u{1F3E1}",
  Furniture: "\u{1FA91}",
  Books: "\u{1F4DA}",
  Clothing: "\u{1F9E5}",
  Services: "\u{1F6E0}\u{FE0F}",
  Tickets: "\u{1F39F}\u{FE0F}",
  Bikes: "\u{1F6B2}",
  Appliances: "\u{1F373}",
};

export default async function HomePage() {
  const userId = getCurrentUserId();

  const [user, categories, trending, recent, freeStuff] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listing.findMany({ select: { category: true }, distinct: ["category"] }),
    prisma.listing.findMany({
      orderBy: { viewCount: "desc" },
      where: { status: "AVAILABLE" },
      include: { images: true },
      take: 6,
    }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      where: { status: "AVAILABLE" },
      include: { images: true },
      take: 8,
    }),
    prisma.listing.findMany({
      where: { priceCents: 0, status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      include: { images: true },
      take: 4,
    }),
  ]);

  const campus = user?.campus ?? "Main Campus";
  const nearYou = await prisma.listing.findMany({
    where: { campus, status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    include: { images: true },
    take: 6,
  });

  const categoryOptions = categories.map((c) => c.category).sort();
  const userName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      {/* Search Bar — Top */}
      <form className="home-search" action="/marketplace" method="get">
        <input
          name="q"
          placeholder="Search for textbooks, furniture, bikes..."
          autoComplete="off"
          type="search"
        />
        <button type="submit">Search</button>
      </form>

      {/* Welcome + Quick Actions */}
      <section className="home-welcome">
        <h1>Welcome, <Em>{userName}</Em></h1>
        <Text as="p" size="4" color="muted">What would you like to find today?</Text>

        <div className="home-actions">
          <Link className="home-action-card" href="/marketplace/new">
            <div className="home-action-icon post">+</div>
            <span>Post Listing</span>
          </Link>
          <Link className="home-action-card" href="/marketplace/bulk">
            <div className="home-action-icon messages">📦</div>
            <span>Bulk Upload</span>
          </Link>
          <Link className="home-action-card" href="/saved">
            <div className="home-action-icon saved">♥</div>
            <span>Saved</span>
          </Link>
          <Link className="home-action-card" href="/profile">
            <div className="home-action-icon profile">👤</div>
            <span>Profile</span>
          </Link>
        </div>
      </section>

      {/* Category Pills */}
      {categoryOptions.length > 0 && (
        <div className="home-categories">
          <Link className="home-cat-chip" href="/marketplace">
            🔥 All
          </Link>
          {categoryOptions.map((cat) => (
            <Link
              key={cat}
              className="home-cat-chip"
              href={`/marketplace?category=${encodeURIComponent(cat)}`}
            >
              {categoryIcons[cat] ?? "🛒"} {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Trending Now */}
      {trending.length > 0 && (
        <section>
          <div className="home-section-header">
            <Heading as="h2" size="5">🔥 Trending Now</Heading>
            <Link href="/marketplace?type=TRENDING">See all →</Link>
          </div>
          <div className="home-grid-6">
            {trending.map((item) => {
              const img = item.images[0]?.url;
              return (
                <Link key={item.id} className="card card-hover" href={`/marketplace/${item.id}`}>
                  {img ? (
                    <img className="card-image" src={img} alt={item.title} loading="lazy" width={400} height={400} />
                  ) : (
                    <div className="card-image placeholder" aria-hidden="true" />
                  )}
                  <div className="card-body">
                    <p className="price">{formatPrice(item.priceCents)}</p>
                    <h3>{item.title}</h3>
                    <p className="meta">{item.campus}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Listed */}
      {recent.length > 0 && (
        <section>
          <div className="home-section-header">
            <Heading as="h2" size="5">🕐 Recently Listed</Heading>
            <Link href="/marketplace">See all →</Link>
          </div>
          <div className="home-grid-4">
            {recent.map((item) => {
              const img = item.images[0]?.url;
              return (
                <Link key={item.id} className="card card-hover home-card-rect" href={`/marketplace/${item.id}`}>
                  {img ? (
                    <img className="card-image" src={img} alt={item.title} loading="lazy" width={400} height={300} />
                  ) : (
                    <div className="card-image placeholder" aria-hidden="true" />
                  )}
                  <div className="card-body">
                    <p className="price">{formatPrice(item.priceCents)}</p>
                    <h3>{item.title}</h3>
                    <p className="home-time">{item.campus} · {timeAgo(item.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Near You */}
      {nearYou.length > 0 && (
        <section>
          <div className="home-section-header">
            <Heading as="h2" size="5">📍 Near You</Heading>
            <Link href={`/marketplace?campus=${encodeURIComponent(campus)}`}>See all →</Link>
          </div>
          <Text as="p" size="2" color="muted" style={{ marginTop: -8, marginBottom: 12 }}>
            Items near <Strong>{campus}</Strong>
          </Text>
          <div className="home-grid-6">
            {nearYou.map((item) => {
              const img = item.images[0]?.url;
              return (
                <Link key={item.id} className="home-card-portrait" href={`/marketplace/${item.id}`}>
                  {img ? (
                    <img src={img} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="home-card-portrait-placeholder" aria-hidden="true" />
                  )}
                  <div className="portrait-overlay">
                    <p className="price">{formatPrice(item.priceCents)}</p>
                    <h3>{item.title}</h3>
                    <p className="meta">{item.campus}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Free Stuff */}
      {freeStuff.length > 0 && (
        <section className="home-free-section">
          <div className="home-section-header" style={{ marginTop: 0 }}>
            <Heading as="h2" size="5">🎁 Free Stuff</Heading>
            <Link href="/marketplace?type=FREE">View all →</Link>
          </div>
          <div className="home-free-grid">
            {freeStuff.map((item) => {
              const img = item.images[0]?.url;
              return (
                <Link key={item.id} className="home-card-compact" href={`/marketplace/${item.id}`}>
                  {img ? (
                    <img src={img} alt={item.title} loading="lazy" width={72} height={72} />
                  ) : (
                    <div className="home-card-compact-placeholder" aria-hidden="true" />
                  )}
                  <div className="home-card-compact-body">
                    <span className="free-label">Free</span>
                    <h3>{item.title}</h3>
                    <p className="meta">{item.campus}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
