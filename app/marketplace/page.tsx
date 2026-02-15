import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Text, Heading, Em } from "@/components/ui/typography";

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
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
  furnished?: string;
  pets?: string;
  page?: string;
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
  const page = Math.max(1, Number(searchParams.page) || 1);
  const perPage = 20;

  const userId = getCurrentUserId();

  const whereClause = {
    AND: [
      query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { description: { contains: query, mode: "insensitive" as const } }
            ]
          }
        : {},
      category && category !== "all" ? { category } : {},
      campus && campus !== "all" ? { campus } : {},
      type === "FREE"
        ? { priceCents: 0 }
        : type === "HOUSING"
          ? { category: "Housing" }
          : type === "TRENDING"
            ? {}
            : type !== "all"
              ? { transactionType: type as "SELL" | "RENT" }
              : {},
      Number.isFinite(min) ? { priceCents: { gte: Math.round(min * 100) } } : {},
      Number.isFinite(max) ? { priceCents: { lte: Math.round(max * 100) } } : {},
      type === "HOUSING" && searchParams.furnished === "yes" ? { furnished: true } : {},
      type === "HOUSING" && searchParams.furnished === "no" ? { furnished: false } : {},
      type === "HOUSING" && searchParams.pets === "yes" ? { petsAllowed: true } : {},
    ]
  };

  const [user, categories, campuses, totalCount, listings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listing.findMany({ select: { category: true }, distinct: ["category"] }),
    prisma.listing.findMany({ select: { campus: true }, distinct: ["campus"] }),
    prisma.listing.count({ where: whereClause }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, user: true, savedBy: true, bundle: true },
      where: whereClause,
      skip: (page - 1) * perPage,
      take: perPage,
    })
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  // Trending: top listings by views + saves + conversations
  const trending = await prisma.listing.findMany({
    orderBy: { viewCount: "desc" },
    include: { images: true, user: true, savedBy: true, bundle: true, _count: { select: { savedBy: true, conversations: true } } },
    where: { status: "AVAILABLE" },
    take: 8,
  });

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

  const buySell = listings.filter((listing) => listing.transactionType === "SELL" && listing.priceCents > 0);
  const rentals = listings.filter((listing) => listing.transactionType === "RENT");
  const freeStuff = listings.filter((listing) => listing.priceCents === 0);
  const todayPicks = listings.slice(0, 6);
  const nearYou = listings.filter((listing) => listing.campus === primaryCampus).slice(0, 6);

  const categoryIcons: Record<string, string> = {
    Electronics: "\u{1F4BB}",
    Housing: "\u{1F3E1}",
    Furniture: "\u{1FA91}",
    Books: "\u{1F4DA}",
    Clothing: "\u{1F9E5}",
    Services: "\u{1F6E0}\u{FE0F}",
    Tickets: "\u{1F39F}\u{FE0F}",
    Bikes: "\u{1F6B2}",
    Appliances: "\u{1F373}"
  };

  const cardFor = (listing: (typeof listings)[number]) => {
    const imageUrl = listing.images[0]?.url;
    const hasDiscount = listing.originalPriceCents && listing.originalPriceCents > listing.priceCents;
    return (
      <Link key={listing.id} className="card card-hover" href={`/marketplace/${listing.id}`}>
        <div style={{ position: "relative" }}>
          {imageUrl ? (
            <Image
              className="card-image"
              src={imageUrl}
              alt={listing.title}
              width={400}
              height={400}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="card-image placeholder" aria-hidden="true" />
          )}
          {listing.discountPercent && listing.discountPercent > 0 && (
            <span className="card-discount-badge">-{listing.discountPercent}%</span>
          )}
        </div>
        <div className="card-body">
          <div className="card-price-row">
            <p className="price">{formatPrice(listing.priceCents)}</p>
            {hasDiscount && (
              <span className="card-original-price">{formatPrice(listing.originalPriceCents!)}</span>
            )}
          </div>
          <h3>{listing.title}</h3>
          <p className="meta">{listing.campus}</p>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <Heading as="h1" size="8">Marketplace</Heading>
      <Text as="p" size="3" color="muted" style={{ marginTop: 8 }}>
        Browse <Em>student-only</Em> listings. Toggle between Buy & Sell, Rentals, Free Stuff, or Housing.
      </Text>

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
        <Link className={`tab ${type === "TRENDING" ? "active" : ""}`} href="/marketplace?type=TRENDING">
          Trending
        </Link>
        <Link className={`tab ${type === "FREE" ? "active" : ""}`} href="/marketplace?type=FREE">
          Free Stuff
        </Link>
        <Link className={`tab ${type === "HOUSING" ? "active" : ""}`} href="/marketplace?type=HOUSING">
          Housing
        </Link>
      </div>

      <div className="filter-chips">
        {categoryOptions.map((value) => (
          <Link
            key={value}
            className={`filter-chip ${category === value ? "active" : ""}`}
            href={`/marketplace?category=${encodeURIComponent(value)}`}
          >
            {categoryIcons[value] ?? ""} {value}
          </Link>
        ))}
      </div>

      <div className="market-layout">
        <aside className="filter-panel">
          <h3>Categories</h3>
          <div className="category-list">
            <Link
              className={`category-item ${!category || category === "all" ? "active" : ""}`}
              href="/marketplace"
            >
              <span>{"\u{1F6D2}"}</span>
              <span>Browse all</span>
            </Link>
            {categoryOptions.map((value) => (
              <Link
                key={value}
                className={`category-item ${category === value ? "active" : ""}`}
                href={`/marketplace?category=${encodeURIComponent(value)}`}
              >
                <span>{categoryIcons[value] ?? "\u{1F6D2}"}</span>
                <span>{value}</span>
              </Link>
            ))}
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
              placeholder="Search\u2026 (e.g., bike)"
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
              <option value="TRENDING">Trending</option>
              <option value="FREE">Free Stuff</option>
              <option value="HOUSING">Housing</option>
            </select>
            <label className="sr-only" htmlFor="filter-min">
              Minimum price
            </label>
            <input
              id="filter-min"
              name="min"
              type="number"
              step="0.01"
              placeholder="Min price\u2026 (e.g., 25)"
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
              placeholder="Max price\u2026 (e.g., 250)"
              autoComplete="off"
              inputMode="decimal"
              defaultValue={searchParams.max ?? ""}
            />
            {type === "HOUSING" && (
              <>
                <label className="sr-only" htmlFor="filter-furnished">Furnished</label>
                <select id="filter-furnished" name="furnished" defaultValue={searchParams.furnished ?? "any"}>
                  <option value="any">Furnished: Any</option>
                  <option value="yes">Furnished</option>
                  <option value="no">Unfurnished</option>
                </select>
                <label className="sr-only" htmlFor="filter-pets">Pets</label>
                <select id="filter-pets" name="pets" defaultValue={searchParams.pets ?? "any"}>
                  <option value="any">Pets: Any</option>
                  <option value="yes">Pets allowed</option>
                </select>
              </>
            )}
            <button className="button" type="submit">
              Apply Filters
            </button>
            <Link className="button" href="/marketplace">
              Clear Filters
            </Link>
          </form>

          {activeFilters.length > 0 && (
            <div className="active-filters">
              Active: {activeFilters.join(" \u00B7 ")}
            </div>
          )}
        </aside>

        <section>
          {type === "all" && (
            <div className="section-stack">
              {trending.length > 0 && (
                <div>
                  <Heading as="h2" size="5" className="section-title">Trending</Heading>
                  <div className="card-grid">
                    {trending.slice(0, 4).map((item) => {
                      const imageUrl = item.images[0]?.url;
                      return (
                        <Link key={item.id} className="card card-hover" href={`/marketplace/${item.id}`}>
                          {imageUrl ? (
                            <Image className="card-image" src={imageUrl} alt={item.title} width={400} height={400} sizes="(max-width: 768px) 50vw, 25vw" />
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
                </div>
              )}

              <div>
                <Heading as="h2" size="5" className="section-title">Today&apos;s Picks</Heading>
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
                <Heading as="h2" size="5" className="section-title">Near You \u00B7 {primaryCampus}</Heading>
                <div className="card-grid">
                  {nearYou.map(cardFor)}
                  {!nearYou.length && (
                    <div className="card">
                      <p>No nearby listings yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {freeStuff.length > 0 && (
                <div>
                  <Heading as="h2" size="5" className="section-title">Free Stuff</Heading>
                  <div className="card-grid">
                    {freeStuff.map(cardFor)}
                  </div>
                </div>
              )}

              <div>
                <Heading as="h2" size="5" className="section-title">Buy & Sell</Heading>
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
                <Heading as="h2" size="5" className="section-title">Rentals</Heading>
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

          {type === "TRENDING" && (
            <div>
              <Heading as="h2" size="5" className="section-title">Trending</Heading>
              <div className="card-grid">
                {trending.map((item) => {
                  const imageUrl = item.images[0]?.url;
                  return (
                    <Link key={item.id} className="card card-hover" href={`/marketplace/${item.id}`}>
                      {imageUrl ? (
                        <Image className="card-image" src={imageUrl} alt={item.title} width={400} height={400} sizes="(max-width: 768px) 50vw, 25vw" />
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
                {!trending.length && (
                  <div className="card">
                    <p>No trending listings yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {type !== "all" && type !== "TRENDING" && (
            <div>
              <Heading as="h2" size="5" className="section-title">
                {type === "SELL" ? "Buy & Sell" : type === "RENT" ? "Rentals" : type === "FREE" ? "Free Stuff" : "Housing"}
              </Heading>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && (
                <Link
                  className="pagination-btn"
                  href={`/marketplace?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(campus ? { campus } : {}),
                    ...(type !== "all" ? { type } : {}),
                    ...(searchParams.min ? { min: searchParams.min } : {}),
                    ...(searchParams.max ? { max: searchParams.max } : {}),
                    page: String(page - 1),
                  }).toString()}`}
                >
                  ← Previous
                </Link>
              )}
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  className="pagination-btn"
                  href={`/marketplace?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(campus ? { campus } : {}),
                    ...(type !== "all" ? { type } : {}),
                    ...(searchParams.min ? { min: searchParams.min } : {}),
                    ...(searchParams.max ? { max: searchParams.max } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
