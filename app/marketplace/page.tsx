import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function formatStatus(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "RESERVED":
      return "Reserved";
    case "SOLD":
      return "Sold";
    default:
      return status;
  }
}

type MarketplaceSearchParams = {
  q?: string;
  category?: string;
  campus?: string;
  type?: string;
  min?: string;
  max?: string;
};

export default async function MarketplacePage({
  searchParams
}: {
  searchParams: MarketplaceSearchParams;
}) {
  const query = searchParams.q?.trim();
  const category = searchParams.category?.trim();
  const campus = searchParams.campus?.trim();
  const type = searchParams.type?.trim() ?? "all";
  const min = Number(searchParams.min);
  const max = Number(searchParams.max);

  const userId = getCurrentUserId();
  const [user, categories, campuses, listings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listing.findMany({ select: { category: true }, distinct: ["category"] }),
    prisma.listing.findMany({ select: { campus: true }, distinct: ["campus"] }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, user: true, savedBy: true },
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } }
                ]
              }
            : {},
          category && category !== "all" ? { category } : {},
          campus && campus !== "all" ? { campus } : {},
          type !== "all" ? { transactionType: type as "SELL" | "RENT" } : {},
          Number.isFinite(min) ? { priceCents: { gte: Math.round(min * 100) } } : {},
          Number.isFinite(max) ? { priceCents: { lte: Math.round(max * 100) } } : {}
        ]
      }
    })
  ]);

  const categoryOptions = categories.map((item) => item.category).sort();
  const campusOptions = campuses.map((item) => item.campus).sort();
  const primaryCampus = campus ?? user?.campus ?? campusOptions[0] ?? "Main Campus";

  const activeFilters = [
    query ? `Search: ${query}` : null,
    category && category !== "all" ? `Category: ${category}` : null,
    campus && campus !== "all" ? `Campus: ${campus}` : null,
    type !== "all" ? `Type: ${type}` : null,
    Number.isFinite(min) ? `Min: $${min}` : null,
    Number.isFinite(max) ? `Max: $${max}` : null
  ].filter(Boolean);

  const buySell = listings.filter((listing) => listing.transactionType === "SELL");
  const rentals = listings.filter((listing) => listing.transactionType === "RENT");
  const todayPicks = listings.slice(0, 6);
  const nearYou = listings.filter((listing) => listing.campus === primaryCampus).slice(0, 6);

  const categoryIcons: Record<string, string> = {
    Electronics: "💻",
    Housing: "🏡",
    Furniture: "🪑",
    Books: "📚",
    Clothing: "🧥",
    Services: "🛠️",
    Tickets: "🎟️",
    Bikes: "🚲",
    Appliances: "🍳"
  };

  const cardFor = (listing: (typeof listings)[number]) => {
    const imageUrl = listing.images[0]?.url;
    const isSaved = listing.savedBy.some((save) => save.userId === userId);
    return (
      <Link key={listing.id} className="card card-hover" href={`/marketplace/${listing.id}`}>
        {imageUrl ? (
          <img
            className="card-image"
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            width={400}
            height={180}
          />
        ) : (
          <div className="card-image placeholder" aria-hidden="true" />
        )}
        <div className="card-body">
          <div className="card-meta-row">
            <p className="tag">{listing.transactionType}</p>
            {isSaved && <span className="saved-pill">Saved</span>}
          </div>
          <h3>{listing.title}</h3>
          <p className="price">{formatPrice(listing.priceCents)}</p>
          <p className="meta">{listing.campus}</p>
          <p className="meta">Status: {formatStatus(listing.status)}</p>
          <p className="meta">Seller: {listing.user.name}</p>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <h1>Marketplace</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>
        Browse student-only listings. Toggle between Buy & Sell or Rentals, or view all.
      </p>

      <div className="marketplace-tabs" style={{ marginTop: 16 }}>
        <Link className={`tab ${type === "all" ? "active" : ""}`} href="/marketplace">
          All
        </Link>
        <Link className={`tab ${type === "SELL" ? "active" : ""}`} href="/marketplace?type=SELL">
          Buy & Sell
        </Link>
        <Link className={`tab ${type === "RENT" ? "active" : ""}`} href="/marketplace?type=RENT">
          Rentals
        </Link>
      </div>

      <div className="market-layout">
        <aside className="filter-panel">
          <h3>Categories</h3>
          <div className="category-list">
            {categoryOptions.map((value) => (
              <Link
                key={value}
                className={`category-item ${category === value ? "active" : ""}`}
                href={`/marketplace?category=${encodeURIComponent(value)}`}
              >
                <span>{categoryIcons[value] ?? "🛒"}</span>
                <span>{value}</span>
              </Link>
            ))}
            {!categoryOptions.length && <p className="meta">No categories yet.</p>}
          </div>
          <Link className="button" href="/saved">
            Saved items
          </Link>
          <h3 style={{ marginTop: 20 }}>Filters</h3>
          <form method="get" className="filter-form">
            <label className="sr-only" htmlFor="filter-search">
              Search listings
            </label>
            <input
              id="filter-search"
              name="q"
              placeholder="Search… (e.g., bike)"
              autoComplete="off"
              defaultValue={query ?? ""}
            />
            <label className="sr-only" htmlFor="filter-category">
              Category
            </label>
            <select id="filter-category" name="category" defaultValue={category ?? "all"}>
              <option value="all">All categories</option>
              {categoryOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="filter-campus">
              Campus
            </label>
            <select id="filter-campus" name="campus" defaultValue={campus ?? "all"}>
              <option value="all">All campuses</option>
              {campusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="filter-type">
              Listing type
            </label>
            <select id="filter-type" name="type" defaultValue={type}>
              <option value="all">Sell or rent</option>
              <option value="SELL">Buy & Sell</option>
              <option value="RENT">Rentals</option>
            </select>
            <label className="sr-only" htmlFor="filter-min">
              Minimum price
            </label>
            <input
              id="filter-min"
              name="min"
              type="number"
              step="0.01"
              placeholder="Min price… (e.g., 25)"
              autoComplete="off"
              inputMode="decimal"
              defaultValue={searchParams.min ?? ""}
            />
            <label className="sr-only" htmlFor="filter-max">
              Maximum price
            </label>
            <input
              id="filter-max"
              name="max"
              type="number"
              step="0.01"
              placeholder="Max price… (e.g., 250)"
              autoComplete="off"
              inputMode="decimal"
              defaultValue={searchParams.max ?? ""}
            />
            <button className="button" type="submit">
              Apply Filters
            </button>
            <Link className="button" href="/marketplace">
              Clear Filters
            </Link>
          </form>

          {activeFilters.length > 0 && (
            <div className="active-filters">
              Active: {activeFilters.join(" · ")}
            </div>
          )}
        </aside>

        <section>
          {type === "all" && (
            <div className="section-stack">
              <div>
                <h2 className="section-title">Today's Picks</h2>
                <div className="card-grid">
                  {todayPicks.map(cardFor)}
                  {!todayPicks.length && (
                    <div className="card">
                      <p>No picks yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="section-title">Near You · {primaryCampus}</h2>
                <div className="card-grid">
                  {nearYou.map(cardFor)}
                  {!nearYou.length && (
                    <div className="card">
                      <p>No nearby listings yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="section-title">Buy & Sell</h2>
                <div className="card-grid">
                  {buySell.map(cardFor)}
                  {!buySell.length && (
                    <div className="card">
                      <p>No Buy & Sell listings yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="section-title">Rentals</h2>
                <div className="card-grid">
                  {rentals.map(cardFor)}
                  {!rentals.length && (
                    <div className="card">
                      <p>No rental listings yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {type !== "all" && (
            <div>
              <h2 className="section-title">{type === "SELL" ? "Buy & Sell" : "Rentals"}</h2>
              <div className="card-grid">
                {listings.map(cardFor)}
                {!listings.length && (
                  <div className="card">
                    <p>No listings match your filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
