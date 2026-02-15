import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { createReport, createReview, createMutualReview, startConversation, toggleSavedListing, markAsSoldAction, toggleFollow, incrementViewCount, createOffer, respondToOffer, toggleReviewsDisabled } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import ShareButton from "@/components/ShareButton";
import BadgeList from "@/components/BadgeList";
import FollowButton from "@/components/FollowButton";
import { getUserBadges } from "@/lib/badges";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function formatDelivery(option: string) {
  switch (option) {
    case "MEETUP": return "Meet on campus";
    case "DELIVERY": return "Local delivery";
    case "PICKUP": return "Pickup only";
    default: return option;
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "AVAILABLE": return "Available";
    case "RESERVED": return "Reserved";
    case "SOLD": return "Sold";
    default: return status;
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

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

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      user: true,
      reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" } },
      savedBy: true,
      transactions: true,
      offers: { include: { buyer: true }, orderBy: { createdAt: "desc" } },
    }
  });

  if (!listing) {
    return <div className="detail-empty">Listing not found.</div>;
  }

  incrementViewCount(listing.id).catch(() => {});

  const currentUserId = getCurrentUserId();
  const isSaved = listing.savedBy.some((save) => save.userId === currentUserId);
  const averageRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
      : 0;
  const priceMin = Math.round(listing.priceCents * 0.8);
  const priceMax = Math.round(listing.priceCents * 1.2);

  const sellerBadges = await getUserBadges(listing.userId);

  const isFollowing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: currentUserId, followingId: listing.userId } },
  });

  const followingWhoTransacted = listing.userId !== currentUserId
    ? await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          following: { purchases: { some: { sellerId: listing.userId } } },
        },
        include: { following: { select: { name: true } } },
        take: 3,
      })
    : [];

  const conversationBuyers = listing.userId === currentUserId && listing.status === "AVAILABLE"
    ? await prisma.conversationParticipant.findMany({
        where: {
          conversation: { listingId: listing.id },
          userId: { not: currentUserId },
        },
        include: { user: true },
      })
    : [];
  const uniqueBuyers = Array.from(
    new Map(conversationBuyers.map((p) => [p.userId, p.user])).values()
  );

  const userTransaction = listing.transactions.find(
    (t) => t.buyerId === currentUserId || t.sellerId === currentUserId
  );
  const existingReview = userTransaction
    ? await prisma.review.findUnique({
        where: {
          transactionId_reviewerId: {
            transactionId: userTransaction.id,
            reviewerId: currentUserId,
          },
        },
      })
    : null;

  const primaryRecommendations = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      category: listing.category,
      campus: listing.campus,
      transactionType: listing.transactionType,
      priceCents: { gte: priceMin, lte: priceMax }
    },
    include: { user: true, images: true },
    take: 4
  });

  const recommendationIds = new Set(primaryRecommendations.map((item) => item.id));
  const fallbackRecommendations =
    primaryRecommendations.length < 4
      ? await prisma.listing.findMany({
          where: { id: { notIn: [listing.id, ...recommendationIds] } },
          include: { user: true, images: true },
          orderBy: { createdAt: "desc" },
          take: 4 - primaryRecommendations.length
        })
      : [];

  const recommendations = [...primaryRecommendations, ...fallbackRecommendations];
  const imageUrl = listing.images[0]?.url;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="detail-breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/marketplace">Marketplace</Link>
        <span>›</span>
        <Link href={`/marketplace?category=${encodeURIComponent(listing.category)}`}>{listing.category}</Link>
        <span>›</span>
        <span className="current">{listing.title}</span>
      </nav>

      <div className="listing-detail">
        {/* Left: Images */}
        <div>
          <div className="detail-gallery-panel">
            {imageUrl ? (
              <div className="gallery">
                <img
                  className="detail-image"
                  src={imageUrl}
                  alt={listing.title}
                  width={900}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                />
                {listing.images.length > 1 && (
                  <div className="gallery-grid">
                    {listing.images.slice(1, 5).map((img) => (
                      <img key={img.id} src={img.url} alt={listing.title} loading="lazy" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="detail-image placeholder" aria-hidden="true" />
            )}
          </div>

          {/* Description */}
          <div className="detail-section">
            <Heading as="h2" size="4">Description</Heading>
            <Text as="p" size="2">{listing.description}</Text>
          </div>

          {/* Details grid */}
          <div className="detail-section">
            <Heading as="h2" size="4">Details</Heading>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <Text size="1" weight="medium" color="muted" className="detail-info-label">Condition</Text>
                <Text size="2">{listing.condition}</Text>
              </div>
              <div className="detail-info-item">
                <Text size="1" weight="medium" color="muted" className="detail-info-label">Category</Text>
                <Text size="2">{listing.category}</Text>
              </div>
              <div className="detail-info-item">
                <Text size="1" weight="medium" color="muted" className="detail-info-label">Status</Text>
                <Text size="2">{formatStatus(listing.status)}</Text>
              </div>
              <div className="detail-info-item">
                <Text size="1" weight="medium" color="muted" className="detail-info-label">Views</Text>
                <Text size="2">{listing.viewCount}</Text>
              </div>
              {listing.rentalPeriodDays && (
                <div className="detail-info-item">
                  <Text size="1" weight="medium" color="muted" className="detail-info-label">Rental Period</Text>
                  <Text size="2">{listing.rentalPeriodDays} days</Text>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & location */}
          <div className="detail-section">
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <Text size="1" weight="medium" color="muted" className="detail-info-label">📍 Meetup Location</Text>
                <Text size="2">{listing.campus}</Text>
              </div>
              <div className="detail-info-item">
                <Text size="1" weight="medium" color="muted" className="detail-info-label">📦 Delivery</Text>
                <Text size="2">{listing.deliveryOptions.length ? listing.deliveryOptions.map(formatDelivery).join(", ") : "Meet on campus"}</Text>
              </div>
            </div>
          </div>

          {/* Housing details */}
          {(listing.moveInDate || listing.moveOutDate || listing.furnished !== null || listing.roommates !== null || listing.petsAllowed) && (
            <div className="detail-section">
              <Heading as="h2" size="4">Housing Details</Heading>
              <div className="detail-info-grid">
                {listing.moveInDate && <div className="detail-info-item"><Text size="1" weight="medium" color="muted" className="detail-info-label">Move in</Text><Text size="2">{formatDate(listing.moveInDate)}</Text></div>}
                {listing.moveOutDate && <div className="detail-info-item"><Text size="1" weight="medium" color="muted" className="detail-info-label">Move out</Text><Text size="2">{formatDate(listing.moveOutDate)}</Text></div>}
                {listing.furnished !== null && <div className="detail-info-item"><Text size="1" weight="medium" color="muted" className="detail-info-label">Furnished</Text><Text size="2">{listing.furnished ? "Yes" : "No"}</Text></div>}
                {listing.roommates !== null && <div className="detail-info-item"><Text size="1" weight="medium" color="muted" className="detail-info-label">Roommates</Text><Text size="2">{listing.roommates}</Text></div>}
                {listing.petsAllowed && <div className="detail-info-item"><Text size="1" weight="medium" color="muted" className="detail-info-label">Pets</Text><Text size="2">Allowed</Text></div>}
              </div>
            </div>
          )}

          {/* Safety tip */}
          <div className="detail-safety-tip">
            <Strong>🛡️ Safety Tip:</Strong> Always meet in a <Em>public place on campus</Em>. Avoid exchanging money before meeting.
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="detail-sidebar">
          <div className="panel">
            <Heading as="h1" size="6" className="detail-title">{listing.title}</Heading>
            <div className="detail-price-row">
              <Text as="p" size="8" weight="bold" color="accent" className="detail-price">{formatPrice(listing.priceCents)}</Text>
              {listing.originalPriceCents && listing.originalPriceCents > listing.priceCents && (
                <span className="detail-original-price">{formatPrice(listing.originalPriceCents)}</span>
              )}
              {listing.discountPercent && listing.discountPercent > 0 && (
                <span className="discount-badge">-{listing.discountPercent}%</span>
              )}
            </div>
            {listing.priceCents === 0 && <span className="free-tag" style={{ marginTop: 4 }}>FREE</span>}
            {listing.saleEndsAt && new Date(listing.saleEndsAt) > new Date() && (
              <div className="sale-timer">
                Sale ends {formatDate(listing.saleEndsAt)}
              </div>
            )}
            <Text as="p" size="1" color="muted" style={{ marginTop: 8 }}>Listed <Em>{timeAgo(listing.createdAt)}</Em></Text>

            {listing.flairs.length > 0 && (
              <div className="flair-list" style={{ marginTop: 10 }}>
                {listing.flairs.map((flair) => (
                  <span key={flair} className="flair-chip">{flair}</span>
                ))}
              </div>
            )}

            {listing.userId !== currentUserId && (
              <div className="detail-action-buttons">
                <form action={startConversation}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="sellerId" value={listing.userId} />
                  <input type="hidden" name="message" value="Hi, is this still available?" />
                  <SubmitButton label="💬 Message Seller" pendingLabel="Starting..." />
                </form>
                <form action={toggleSavedListing.bind(null, listing.id)}>
                  <SubmitButton label={isSaved ? "♥ Saved" : "♡ Save"} pendingLabel="..." />
                </form>
              </div>
            )}

            <ShareButton
              title={listing.title}
              url={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/marketplace/${listing.id}`}
            />
          </div>

          {/* Seller card */}
          <div className="panel detail-seller-card">
            <div className="detail-seller-header">
              <div className="detail-seller-avatar">
                {listing.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <Text as="p" size="3" weight="medium" className="detail-seller-name">{listing.user.name}</Text>
                <Text as="p" size="1" color="muted">{listing.user.universityEmail}</Text>
                <BadgeList badges={sellerBadges} />
              </div>
            </div>
            <Text as="p" size="2" color="muted" style={{ marginTop: 8 }}>
              ⭐ <Strong>{averageRating.toFixed(1)}</Strong> <Em>({listing.reviews.length} reviews)</Em>
            </Text>

            {/* Contact info — opt-in by seller */}
            {(listing.showEmail || listing.showPhone) && listing.userId !== currentUserId && (
              <div className="seller-contact-info">
                {listing.showEmail && listing.user.email && (
                  <a href={`mailto:${listing.user.email}`} className="seller-contact-row">
                    <span className="seller-contact-icon">✉️</span>
                    <span>{listing.user.email}</span>
                  </a>
                )}
                {listing.showPhone && listing.user.phone && (
                  <a href={`tel:${listing.user.phone}`} className="seller-contact-row">
                    <span className="seller-contact-icon">📱</span>
                    <span>{listing.user.phone}</span>
                  </a>
                )}
                {listing.showPhone && !listing.user.phone && (
                  <Text as="p" size="1" color="muted"><Em>Seller hasn&apos;t added a phone number yet.</Em></Text>
                )}
              </div>
            )}

            {followingWhoTransacted.length > 0 && (
              <div className="social-proof">
                {followingWhoTransacted.map((f) => f.following.name).join(", ")} bought from this seller
              </div>
            )}

            {listing.userId !== currentUserId && (
              <FollowButton
                action={toggleFollow.bind(null, listing.userId)}
                isFollowing={!!isFollowing}
              />
            )}

            {listing.userId === currentUserId && (
              <>
                <Text as="p" size="2" color="muted" style={{ marginTop: 8 }}><Em>This is your listing.</Em></Text>
                <form action={toggleReviewsDisabled.bind(null, listing.id)} style={{ marginTop: 8 }}>
                  <SubmitButton
                    label={listing.reviewsDisabled ? "Enable Reviews" : "Disable Reviews"}
                    pendingLabel="Updating..."
                  />
                </form>
              </>
            )}
          </div>

          {/* Owner: Mark as sold */}
          {listing.userId === currentUserId && listing.status === "AVAILABLE" && uniqueBuyers.length > 0 && (
            <div className="panel">
              <form action={markAsSoldAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <Heading as="h3" size="3">Mark as Sold</Heading>
                <label className="sr-only" htmlFor="buyer-select">Select buyer</label>
                <select id="buyer-select" name="buyerId">
                  {uniqueBuyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                  ))}
                </select>
                <SubmitButton label="Mark as Sold" pendingLabel="Marking..." />
              </form>
            </div>
          )}

          {/* Make an Offer (buyer) */}
          {listing.userId !== currentUserId && listing.priceCents > 0 && listing.status === "AVAILABLE" && (
            <div className="panel">
              <h3>Make an Offer</h3>
              <form action={createOffer} style={{ marginTop: 8 }}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="sellerId" value={listing.userId} />
                <div className="offer-input-row">
                  <span className="offer-currency">$</span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Your offer"
                    required
                    className="offer-amount-input"
                  />
                </div>
                <p className="meta" style={{ marginTop: 4, marginBottom: 8 }}>
                  Suggested: {formatPrice(Math.round(listing.priceCents * 0.85))} - {formatPrice(Math.round(listing.priceCents * 0.95))}
                </p>
                <textarea name="message" placeholder="Message to seller (optional)" />
                <SubmitButton label="Send Offer" pendingLabel="Sending..." />
              </form>
            </div>
          )}

          {/* Incoming Offers (seller) */}
          {listing.userId === currentUserId && listing.offers.length > 0 && (
            <div className="panel">
              <h3>Incoming Offers</h3>
              <div className="offers-list">
                {listing.offers.map((offer) => (
                  <div key={offer.id} className="offer-item">
                    <div className="offer-item-header">
                      <div className="messages-conv-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>
                        {offer.buyer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{offer.buyer.name}</p>
                        <p className="offer-amount">{formatPrice(offer.amountCents)}</p>
                      </div>
                    </div>
                    {offer.message && <p className="meta" style={{ marginTop: 6 }}>{offer.message}</p>}
                    {offer.status === "PENDING" && (
                      <div className="offer-actions">
                        <form action={respondToOffer}>
                          <input type="hidden" name="offerId" value={offer.id} />
                          <input type="hidden" name="action" value="ACCEPTED" />
                          <SubmitButton label="Accept" pendingLabel="..." />
                        </form>
                        <form action={respondToOffer}>
                          <input type="hidden" name="offerId" value={offer.id} />
                          <input type="hidden" name="action" value="DECLINED" />
                          <SubmitButton label="Decline" pendingLabel="..." />
                        </form>
                      </div>
                    )}
                    {offer.status !== "PENDING" && (
                      <span className={`pill ${offer.status === "ACCEPTED" ? "accent" : ""}`}>
                        {offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message form (expanded) */}
          {listing.userId !== currentUserId && (
            <div className="panel">
              <h3>Send a message</h3>
              <form action={startConversation} style={{ marginTop: 8 }}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="sellerId" value={listing.userId} />
                <textarea name="message" placeholder="Hi, is this still available?" autoComplete="off" />
                <SubmitButton label="Send Message" pendingLabel="Sending..." />
              </form>
            </div>
          )}

          {/* Report — only shown to non-owners */}
          {listing.userId !== currentUserId && (
            <div className="panel">
              <h3>Report listing</h3>
              <form action={createReport} style={{ marginTop: 8 }}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input name="reason" placeholder="Reason (e.g., scam)" required minLength={3} />
                <textarea name="details" placeholder="Add details (optional)" minLength={3} />
                <SubmitButton label="Submit Report" pendingLabel="Sending..." />
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="detail-section" style={{ marginTop: 32 }}>
        <Heading as="h2" size="5">Reviews</Heading>
        {listing.reviewsDisabled ? (
          <Text as="p" size="2" color="muted"><Em>Reviews are disabled for this listing.</Em></Text>
        ) : (
          <>
            <div className="review-list">
              {listing.reviews.map((review) => (
                <div className="panel" key={review.id}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Text size="1" className="tag">⭐ {review.rating}/5</Text>
                    {review.role && (
                      <span className="user-badge verified">{review.role === "BUYER" ? "Buyer" : "Seller"}</span>
                    )}
                  </div>
                  <Text as="p" size="2" weight="medium">{review.reviewer.name}</Text>
                  {review.comment && <Text as="p" size="2" color="muted"><Em>{review.comment}</Em></Text>}
                </div>
              ))}
              {!listing.reviews.length && (
                <Text as="p" size="2" color="muted"><Em>No reviews yet.</Em></Text>
              )}
            </div>

            {userTransaction && !existingReview && (
              <form action={createMutualReview} className="panel" style={{ marginTop: 16 }}>
                <input type="hidden" name="transactionId" value={userTransaction.id} />
                <Heading as="h3" size="3">Review this transaction</Heading>
                <select name="rating" defaultValue="5">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Okay</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
                <textarea name="comment" placeholder="Write a short review..." />
                <SubmitButton label="Post Review" pendingLabel="Posting..." />
              </form>
            )}

            {listing.userId !== currentUserId && !userTransaction && (
              <form action={createReview} className="panel" style={{ marginTop: 16 }}>
                <input type="hidden" name="sellerId" value={listing.userId} />
                <input type="hidden" name="listingId" value={listing.id} />
                <select name="rating" defaultValue="5">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Okay</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
                <textarea name="comment" placeholder="Write a short review..." />
                <SubmitButton label="Post Review" pendingLabel="Posting..." />
              </form>
            )}
          </>
        )}
      </div>

      {/* Similar Items */}
      <div className="home-section-header" style={{ marginTop: 40 }}>
        <Heading as="h2" size="5">Similar Items on Campus</Heading>
        <Link href={`/marketplace?category=${encodeURIComponent(listing.category)}`}>See all →</Link>
      </div>
      <div className="home-grid-4">
        {recommendations.map((item) => (
          <Link key={item.id} className="card card-hover" href={`/marketplace/${item.id}`}>
            {item.images?.[0]?.url ? (
              <img className="card-image" src={item.images[0].url} alt={item.title} width={400} height={400} loading="lazy" />
            ) : (
              <div className="card-image placeholder" aria-hidden="true" />
            )}
            <div className="card-body">
              <p className="price">{formatPrice(item.priceCents)}</p>
              <h3>{item.title}</h3>
              <p className="meta">{item.campus}</p>
            </div>
          </Link>
        ))}
        {!recommendations.length && (
          <p className="meta">No similar items yet.</p>
        )}
      </div>
    </div>
  );
}
