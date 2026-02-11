import Link from "next/link";
import { prisma } from "@/lib/db";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
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

  const [categories, campuses, listings] = await Promise.all([
    prisma.listing.findMany({ select: { category: true }, distinct: ["category"] }),
    prisma.listing.findMany({ select: { campus: true }, distinct: ["campus"] }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, user: true },
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
          <h3>Filters</h3>
          <form method="get" className="filter-form">
            <input name="q" placeholder="Search" defaultValue={query ?? ""} />
            <select name="category" defaultValue={category ?? "all"}>
              <option value="all">All categories</option>
              {categoryOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select name="campus" defaultValue={campus ?? "all"}>
              <option value="all">All campuses</option>
              {campusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select name="type" defaultValue={type}>
              <option value="all">Sell or rent</option>
              <option value="SELL">Buy & Sell</option>
              <option value="RENT">Rentals</option>
            </select>
            <input name="min" type="number" step="0.01" placeholder="Min price" defaultValue={searchParams.min ?? ""} />
            <input name="max" type="number" step="0.01" placeholder="Max price" defaultValue={searchParams.max ?? ""} />
            <button className="button" type="submit">
              Apply
            </button>
            <Link className="button" href="/marketplace">
              Clear
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
                <h2 className="section-title">Buy & Sell</h2>
                <div className="card-grid">
                  {buySell.map((listing) => (
                    <Link key={listing.id} className="card" href={`/marketplace/${listing.id}`}>
                      <p className="tag">{listing.transactionType}</p>
                      <h3>{listing.title}</h3>
                      <p>{formatPrice(listing.priceCents)}</p>
                      <p style={{ color: "var(--muted)" }}>{listing.campus}</p>
                      <p style={{ fontSize: "0.9rem" }}>Seller: {listing.user.name}</p>
                    </Link>
                  ))}
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
                  {rentals.map((listing) => (
                    <Link key={listing.id} className="card" href={`/marketplace/${listing.id}`}>
                      <p className="tag">{listing.transactionType}</p>
                      <h3>{listing.title}</h3>
                      <p>{formatPrice(listing.priceCents)}</p>
                      <p style={{ color: "var(--muted)" }}>{listing.campus}</p>
                      <p style={{ fontSize: "0.9rem" }}>Seller: {listing.user.name}</p>
                    </Link>
                  ))}
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
                {listings.map((listing) => (
                  <Link key={listing.id} className="card" href={`/marketplace/${listing.id}`}>
                    <p className="tag">{listing.transactionType}</p>
                    <h3>{listing.title}</h3>
                    <p>{formatPrice(listing.priceCents)}</p>
                    <p style={{ color: "var(--muted)" }}>{listing.campus}</p>
                    <p style={{ fontSize: "0.9rem" }}>Seller: {listing.user.name}</p>
                  </Link>
                ))}
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
