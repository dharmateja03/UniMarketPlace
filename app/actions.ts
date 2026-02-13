"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { listingSchema, messageSchema, reportSchema, reviewSchema, bundleSchema } from "@/lib/validators";
import { isRateLimited } from "@/lib/rate-limit";

type ActionState = {
  error: string | null;
};

// ── View Count (deduplicated per user, 24h cooldown) ──
export async function incrementViewCount(listingId: string) {
  try {
    const userId = getCurrentUserId();

    // Don't count owner views
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });
    if (listing?.userId === userId) return;

    const existing = await prisma.listingView.findUnique({
      where: { listingId_userId: { listingId, userId } },
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (existing) {
      // Already viewed — only re-count if older than 24h
      if (existing.viewedAt < oneDayAgo) {
        await prisma.listingView.update({
          where: { id: existing.id },
          data: { viewedAt: new Date() },
        });
        await prisma.listing.update({
          where: { id: listingId },
          data: { viewCount: { increment: 1 } },
        });
      }
      // else: viewed recently, skip
    } else {
      // First view ever from this user
      await prisma.listingView.create({
        data: { listingId, userId },
      });
      await prisma.listing.update({
        where: { id: listingId },
        data: { viewCount: { increment: 1 } },
      });
    }
  } catch {
    // silently ignore — non-critical
  }
}

// ── Create Listing ──
export async function createListingAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const imageUrls = formData.getAll("imageUrls").map((value) => String(value)).filter(Boolean);
  const flairs = formData.getAll("flairs").map((value) => String(value)).filter(Boolean);
  const deliveryOptions = formData
    .getAll("deliveryOptions")
    .map((value) => String(value))
    .filter(Boolean);

  const discountPercent = formData.get("discountPercent") ? Number(formData.get("discountPercent")) : null;
  const saleEndsAt = formData.get("saleEndsAt") ? String(formData.get("saleEndsAt")) : null;
  const rawPrice = Math.round(Number(formData.get("price") || 0) * 100);

  const payload = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    priceCents: rawPrice,
    category: String(formData.get("category") || ""),
    condition: String(formData.get("condition") || ""),
    campus: String(formData.get("campus") || ""),
    transactionType: String(formData.get("transactionType") || "SELL"),
    rentalPeriodDays: formData.get("rentalPeriodDays")
      ? Number(formData.get("rentalPeriodDays"))
      : null,
    flairs,
    deliveryOptions,
    imageUrl: formData.get("imageUrl")
      ? String(formData.get("imageUrl"))
      : null,
    imageUrls,
    moveInDate: formData.get("moveInDate") ? String(formData.get("moveInDate")) : null,
    moveOutDate: formData.get("moveOutDate") ? String(formData.get("moveOutDate")) : null,
    furnished: formData.get("furnished") === "true" ? true : formData.get("furnished") === "false" ? false : null,
    roommates: formData.get("roommates") ? Number(formData.get("roommates")) : null,
    petsAllowed: formData.get("petsAllowed") === "true" ? true : null,
  };

  const parsed = listingSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.errors.map((error) => error.message).join(" ");
    return { error: message };
  }

  const userId = getCurrentUserId();

  try {
    await prisma.listing.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceCents: discountPercent ? Math.round(rawPrice * (1 - discountPercent / 100)) : parsed.data.priceCents,
        category: parsed.data.category,
        condition: parsed.data.condition,
        campus: parsed.data.campus,
        transactionType: parsed.data.transactionType,
        rentalPeriodDays: parsed.data.rentalPeriodDays ?? null,
        flairs: parsed.data.flairs ?? [],
        deliveryOptions: parsed.data.deliveryOptions ?? ["MEETUP"],
        userId,
        moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : null,
        moveOutDate: parsed.data.moveOutDate ? new Date(parsed.data.moveOutDate) : null,
        furnished: parsed.data.furnished ?? null,
        roommates: parsed.data.roommates ?? null,
        petsAllowed: parsed.data.petsAllowed ?? null,
        originalPriceCents: discountPercent ? rawPrice : null,
        discountPercent: discountPercent ?? null,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
        images:
          parsed.data.imageUrls?.length || parsed.data.imageUrl
            ? {
                create: [
                  ...(parsed.data.imageUrls ?? []).map((url) => ({ url })),
                  ...(parsed.data.imageUrl ? [{ url: parsed.data.imageUrl }] : [])
                ]
              }
            : undefined
      }
    });
  } catch {
    return { error: "Something went wrong creating your listing. Please try again." };
  }

  revalidatePath("/marketplace");
  redirect("/marketplace/new/success");
}

// ── Start Conversation ──
export async function startConversation(formData: FormData) {
  const listingId = String(formData.get("listingId"));
  const sellerId = String(formData.get("sellerId"));
  const initialMessage = String(formData.get("message") || "").trim();
  const userId = getCurrentUserId();

  if (!listingId || !sellerId) {
    throw new Error("Missing listing or seller.");
  }

  // Prevent messaging yourself
  if (userId === sellerId) {
    throw new Error("You cannot message yourself.");
  }

  if (initialMessage.length > 0 && initialMessage.length < 2) {
    throw new Error("Message must be at least 2 characters.");
  }

  try {
    const convo = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId }, { userId: sellerId }]
        },
        messages: initialMessage
          ? { create: [{ senderId: userId, body: initialMessage }] }
          : undefined
      }
    });

    revalidatePath("/messages");
    redirect(`/messages/${convo.id}`);
  } catch (e) {
    // redirect throws internally — rethrow it
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    // Check if it's a Next.js redirect (has digest property)
    if (typeof e === "object" && e !== null && "digest" in e) throw e;
    throw new Error("Could not start conversation. Please try again.");
  }
}

// ── Send Message ──
export async function sendMessage(conversationId: string, formData: FormData) {
  const payload = { body: String(formData.get("body") || "").trim() };
  const parsed = messageSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Message must be at least 1 character.");
  }

  const userId = getCurrentUserId();

  // Rate limit: 20 messages per minute
  if (isRateLimited(`${userId}:sendMessage`, 20, 60_000)) {
    throw new Error("You're sending messages too fast. Please slow down.");
  }

  try {
    await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: parsed.data.body
      }
    });

    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() }
    });
  } catch {
    throw new Error("Failed to send message. Please try again.");
  }

  revalidatePath(`/messages/${conversationId}`);
}

// ── Toggle Saved Listing ──
export async function toggleSavedListing(listingId: string) {
  const userId = getCurrentUserId();

  // Prevent saving your own listing
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { userId: true } });
  if (listing?.userId === userId) {
    return; // silently ignore
  }

  try {
    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { userId_listingId: { userId, listingId } }
      });
    } else {
      await prisma.savedListing.create({
        data: { userId, listingId }
      });
    }
  } catch {
    // silently ignore
  }

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath("/saved");
}

// ── Create Review ──
export async function createReview(formData: FormData) {
  const payload = {
    rating: Number(formData.get("rating") || 0),
    comment: formData.get("comment") ? String(formData.get("comment")).trim() : null,
    listingId: formData.get("listingId") ? String(formData.get("listingId")) : null,
    sellerId: String(formData.get("sellerId") || "")
  };

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(" "));
  }

  const userId = getCurrentUserId();

  // Prevent reviewing yourself
  if (userId === parsed.data.sellerId) {
    throw new Error("You cannot review your own listing.");
  }

  // Check if reviews are disabled on this listing
  if (parsed.data.listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId }, select: { reviewsDisabled: true } });
    if (listing?.reviewsDisabled) {
      throw new Error("Reviews are disabled for this listing.");
    }
  }

  // Rate limit: 3 reviews per minute
  if (isRateLimited(`${userId}:createReview`, 3, 60_000)) {
    throw new Error("You're posting reviews too fast. Please slow down.");
  }

  try {
    await prisma.review.create({
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
        listingId: parsed.data.listingId ?? null,
        sellerId: parsed.data.sellerId,
        reviewerId: userId
      }
    });
  } catch {
    throw new Error("Failed to submit review. Please try again.");
  }

  revalidatePath(`/marketplace/${parsed.data.listingId ?? ""}`);
  revalidatePath("/profile");
}

// ── Create Mutual Review ──
export async function createMutualReview(formData: FormData) {
  const transactionId = String(formData.get("transactionId") || "").trim();
  const rating = Number(formData.get("rating") || 0);
  const comment = formData.get("comment") ? String(formData.get("comment")).trim() : null;
  const userId = getCurrentUserId();

  if (!transactionId || rating < 1 || rating > 5) {
    throw new Error("Invalid review data.");
  }

  if (comment && comment.length < 3) {
    throw new Error("Comment must be at least 3 characters.");
  }

  // Rate limit: 3 reviews per minute
  if (isRateLimited(`${userId}:createReview`, 3, 60_000)) {
    throw new Error("You're posting reviews too fast. Please slow down.");
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!transaction) throw new Error("Transaction not found.");

  // Ensure user is part of this transaction
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new Error("You are not part of this transaction.");
  }

  const isBuyer = transaction.buyerId === userId;
  const role = isBuyer ? "BUYER" : "SELLER";
  const targetId = isBuyer ? transaction.sellerId : transaction.buyerId;

  try {
    await prisma.review.create({
      data: {
        rating,
        comment,
        sellerId: targetId,
        reviewerId: userId,
        transactionId,
        role: role as "BUYER" | "SELLER",
        listingId: transaction.listingId,
      },
    });
  } catch {
    throw new Error("Failed to submit review. You may have already reviewed this transaction.");
  }

  revalidatePath(`/marketplace/${transaction.listingId}`);
  revalidatePath("/profile");
}

// ── Mark as Sold ──
export async function markAsSoldAction(formData: FormData) {
  const listingId = String(formData.get("listingId") || "").trim();
  const buyerId = String(formData.get("buyerId") || "").trim();
  const userId = getCurrentUserId();

  if (!listingId || !buyerId) {
    throw new Error("Missing required fields.");
  }

  // Prevent selling to yourself
  if (userId === buyerId) {
    throw new Error("You cannot sell to yourself.");
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId !== userId) {
    throw new Error("Not authorized.");
  }

  if (listing.status !== "AVAILABLE" && listing.status !== "RESERVED") {
    throw new Error("This listing is already sold.");
  }

  try {
    await prisma.$transaction([
      prisma.listing.update({
        where: { id: listingId },
        data: { status: "SOLD" },
      }),
      prisma.transaction.create({
        data: {
          listingId,
          sellerId: userId,
          buyerId,
          priceCents: listing.priceCents,
        },
      }),
    ]);
  } catch {
    throw new Error("Failed to complete sale. Please try again.");
  }

  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath("/profile");
}

// ── Toggle Follow ──
export async function toggleFollow(targetUserId: string) {
  const userId = getCurrentUserId();
  if (userId === targetUserId) return; // can't follow yourself

  try {
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
      });
    } else {
      await prisma.follow.create({
        data: { followerId: userId, followingId: targetUserId },
      });
    }
  } catch {
    // silently ignore
  }

  revalidatePath("/profile");
  revalidatePath("/marketplace");
}

// ── Create Bundle ──
export async function createBundleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get("title") || "").trim();
  const description = formData.get("description") ? String(formData.get("description")).trim() : null;
  const discountPercent = Number(formData.get("discountPercent") || 0);
  const listingIds = formData.getAll("listingIds").map(String).filter(Boolean);

  const parsed = bundleSchema.safeParse({ title, description, discountPercent, listingIds });
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(" ");
    return { error: message };
  }

  const userId = getCurrentUserId();

  let bundle;
  try {
    bundle = await prisma.bundle.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        discountPercent: parsed.data.discountPercent,
        userId,
      },
    });

    await prisma.listing.updateMany({
      where: { id: { in: parsed.data.listingIds }, userId },
      data: { bundleId: bundle.id },
    });
  } catch {
    return { error: "Failed to create bundle. Please try again." };
  }

  revalidatePath("/profile");
  redirect(`/bundles/${bundle.id}`);
}

// ── Create Report ──
export async function createReport(formData: FormData) {
  const payload = {
    reason: String(formData.get("reason") || "").trim(),
    details: formData.get("details") ? String(formData.get("details")).trim() : null,
    listingId: String(formData.get("listingId") || "")
  };

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(" "));
  }

  const userId = getCurrentUserId();

  // Rate limit: 3 reports per 5 minutes
  if (isRateLimited(`${userId}:createReport`, 3, 300_000)) {
    throw new Error("You're submitting reports too fast. Please wait a few minutes.");
  }

  // Prevent reporting your own listing
  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId }, select: { userId: true } });
  if (listing?.userId === userId) {
    throw new Error("You cannot report your own listing.");
  }

  try {
    await prisma.report.create({
      data: {
        reason: parsed.data.reason,
        details: parsed.data.details ?? null,
        listingId: parsed.data.listingId,
        reporterId: userId
      }
    });
  } catch {
    throw new Error("Failed to submit report. Please try again.");
  }

  revalidatePath(`/marketplace/${parsed.data.listingId}`);
  revalidatePath("/admin/moderation");
}

// ── Update Report Status ──
export async function updateReportStatus(reportId: string, status: string) {
  if (!["OPEN", "UNDER_REVIEW", "RESOLVED"].includes(status)) {
    throw new Error("Invalid status.");
  }

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: status as "OPEN" | "UNDER_REVIEW" | "RESOLVED" }
    });
  } catch {
    throw new Error("Failed to update report.");
  }

  revalidatePath("/admin/moderation");
}

// ── Create Offer ──
export async function createOffer(formData: FormData) {
  const userId = getCurrentUserId();
  const listingId = formData.get("listingId") as string;
  const sellerId = formData.get("sellerId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const message = (formData.get("message") as string)?.trim() || null;

  if (!listingId || !sellerId || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid offer. Please enter a valid amount.");
  }

  // Prevent offering on your own listing
  if (userId === sellerId) {
    throw new Error("You cannot make an offer on your own listing.");
  }

  if (message && message.length < 2) {
    throw new Error("Message must be at least 2 characters.");
  }

  // Rate limit: 5 offers per 5 minutes
  if (isRateLimited(`${userId}:createOffer`, 5, 300_000)) {
    throw new Error("You're making offers too fast. Please wait a few minutes.");
  }

  try {
    await prisma.offer.create({
      data: {
        amountCents: Math.round(amount * 100),
        message,
        listingId,
        buyerId: userId,
        sellerId,
      }
    });
  } catch {
    throw new Error("Failed to send offer. Please try again.");
  }

  revalidatePath(`/marketplace/${listingId}`);
}

// ── Respond to Offer ──
export async function respondToOffer(formData: FormData) {
  const userId = getCurrentUserId();
  const offerId = formData.get("offerId") as string;
  const action = formData.get("action") as string;

  if (!offerId || !["ACCEPTED", "DECLINED"].includes(action)) {
    throw new Error("Invalid action.");
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.sellerId !== userId) {
    throw new Error("Not authorized.");
  }

  if (offer.status !== "PENDING") {
    throw new Error("This offer has already been responded to.");
  }

  try {
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: action as "ACCEPTED" | "DECLINED" }
    });

    if (action === "ACCEPTED") {
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: "RESERVED" }
      });
    }
  } catch {
    throw new Error("Failed to respond to offer. Please try again.");
  }

  revalidatePath(`/marketplace/${offer.listingId}`);
  revalidatePath("/profile");
}

// ── Toggle Reviews on Listing ──
export async function toggleReviewsDisabled(listingId: string) {
  const userId = getCurrentUserId();

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { userId: true, reviewsDisabled: true } });
  if (!listing || listing.userId !== userId) {
    throw new Error("Not authorized.");
  }

  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { reviewsDisabled: !listing.reviewsDisabled },
    });
  } catch {
    throw new Error("Failed to update review settings.");
  }

  revalidatePath(`/marketplace/${listingId}`);
}

// ── Bulk Create Listings ──
export async function bulkCreateListings(_: ActionState, formData: FormData): Promise<ActionState> {
  const userId = getCurrentUserId();
  const count = Number(formData.get("count") || 0);

  if (count < 1 || count > 20) {
    return { error: "You can create between 1 and 20 items at once." };
  }

  const items: Array<{
    title: string;
    description: string;
    priceCents: number;
    category: string;
    condition: string;
    campus: string;
    imageUrl: string | null;
  }> = [];

  for (let i = 0; i < count; i++) {
    const title = String(formData.get(`title_${i}`) || "").trim();
    const description = String(formData.get(`description_${i}`) || "").trim();
    const price = Number(formData.get(`price_${i}`) || 0);
    const category = String(formData.get(`category_${i}`) || "").trim();
    const condition = String(formData.get(`condition_${i}`) || "").trim();
    const campus = String(formData.get(`campus_${i}`) || "").trim();
    const imageUrl = formData.get(`imageUrl_${i}`) ? String(formData.get(`imageUrl_${i}`)) : null;

    if (title.length < 4) return { error: `Item ${i + 1}: Title must be at least 4 characters.` };
    if (description.length < 10) return { error: `Item ${i + 1}: Description must be at least 10 characters.` };
    if (category.length < 3) return { error: `Item ${i + 1}: Category is required.` };
    if (condition.length < 3) return { error: `Item ${i + 1}: Condition is required.` };
    if (campus.length < 3) return { error: `Item ${i + 1}: Campus is required.` };

    items.push({
      title,
      description,
      priceCents: Math.round(price * 100),
      category,
      condition,
      campus,
      imageUrl,
    });
  }

  try {
    for (const item of items) {
      await prisma.listing.create({
        data: {
          title: item.title,
          description: item.description,
          priceCents: item.priceCents,
          category: item.category,
          condition: item.condition,
          campus: item.campus,
          userId,
          flairs: ["Must Go ASAP"],
          deliveryOptions: ["MEETUP"],
          images: item.imageUrl ? { create: [{ url: item.imageUrl }] } : undefined,
        },
      });
    }
  } catch {
    return { error: "Something went wrong creating your listings. Some may have been created." };
  }

  revalidatePath("/marketplace");
  redirect("/marketplace/new/success");
}
