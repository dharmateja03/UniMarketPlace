"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { listingSchema, messageSchema, reportSchema, reviewSchema, bundleSchema } from "@/lib/validators";

type ActionState = {
  error: string | null;
};

export async function createListingAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const imageUrls = formData.getAll("imageUrls").map((value) => String(value)).filter(Boolean);
  const deliveryOptions = formData
    .getAll("deliveryOptions")
    .map((value) => String(value))
    .filter(Boolean);
  const payload = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    priceCents: Math.round(Number(formData.get("price") || 0) * 100),
    category: String(formData.get("category") || ""),
    condition: String(formData.get("condition") || ""),
    campus: String(formData.get("campus") || ""),
    transactionType: String(formData.get("transactionType") || "SELL"),
    rentalPeriodDays: formData.get("rentalPeriodDays")
      ? Number(formData.get("rentalPeriodDays"))
      : null,
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
  const listing = await prisma.listing.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      category: parsed.data.category,
      condition: parsed.data.condition,
      campus: parsed.data.campus,
      transactionType: parsed.data.transactionType,
      rentalPeriodDays: parsed.data.rentalPeriodDays ?? null,
      deliveryOptions: parsed.data.deliveryOptions ?? ["MEETUP"],
      userId,
      moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : null,
      moveOutDate: parsed.data.moveOutDate ? new Date(parsed.data.moveOutDate) : null,
      furnished: parsed.data.furnished ?? null,
      roommates: parsed.data.roommates ?? null,
      petsAllowed: parsed.data.petsAllowed ?? null,
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

  revalidatePath("/marketplace");
  redirect(`/marketplace/${listing.id}`);
}

export async function startConversation(formData: FormData) {
  const listingId = String(formData.get("listingId"));
  const sellerId = String(formData.get("sellerId"));
  const initialMessage = String(formData.get("message") || "");
  const userId = getCurrentUserId();

  if (!listingId || !sellerId) {
    throw new Error("Missing listing or seller.");
  }

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
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const payload = { body: String(formData.get("body") || "") };
  const parsed = messageSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const userId = getCurrentUserId();
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

  revalidatePath(`/messages/${conversationId}`);
}

export async function toggleSavedListing(listingId: string) {
  const userId = getCurrentUserId();
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

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath("/saved");
}

export async function createReview(formData: FormData) {
  const payload = {
    rating: Number(formData.get("rating") || 0),
    comment: formData.get("comment") ? String(formData.get("comment")) : null,
    listingId: formData.get("listingId") ? String(formData.get("listingId")) : null,
    sellerId: String(formData.get("sellerId") || "")
  };

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const userId = getCurrentUserId();
  await prisma.review.create({
    data: {
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
      listingId: parsed.data.listingId ?? null,
      sellerId: parsed.data.sellerId,
      reviewerId: userId
    }
  });

  revalidatePath(`/marketplace/${parsed.data.listingId ?? ""}`);
  revalidatePath("/profile");
}

export async function createMutualReview(formData: FormData) {
  const transactionId = String(formData.get("transactionId") || "");
  const rating = Number(formData.get("rating") || 0);
  const comment = formData.get("comment") ? String(formData.get("comment")) : null;
  const userId = getCurrentUserId();

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!transaction) throw new Error("Transaction not found");

  const isBuyer = transaction.buyerId === userId;
  const role = isBuyer ? "BUYER" : "SELLER";
  const targetId = isBuyer ? transaction.sellerId : transaction.buyerId;

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

  revalidatePath(`/marketplace/${transaction.listingId}`);
  revalidatePath("/profile");
}

export async function markAsSoldAction(formData: FormData) {
  const listingId = String(formData.get("listingId") || "");
  const buyerId = String(formData.get("buyerId") || "");
  const userId = getCurrentUserId();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId !== userId) {
    throw new Error("Not authorized");
  }

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

  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath("/profile");
}

export async function toggleFollow(targetUserId: string) {
  const userId = getCurrentUserId();
  if (userId === targetUserId) return;

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

  revalidatePath("/profile");
  revalidatePath("/marketplace");
}

export async function createBundleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get("title") || "");
  const description = formData.get("description") ? String(formData.get("description")) : null;
  const discountPercent = Number(formData.get("discountPercent") || 0);
  const listingIds = formData.getAll("listingIds").map(String).filter(Boolean);

  const parsed = bundleSchema.safeParse({ title, description, discountPercent, listingIds });
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(" ");
    return { error: message };
  }

  const userId = getCurrentUserId();

  const bundle = await prisma.bundle.create({
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

  revalidatePath("/profile");
  redirect(`/bundles/${bundle.id}`);
}

export async function createReport(formData: FormData) {
  const payload = {
    reason: String(formData.get("reason") || ""),
    details: formData.get("details") ? String(formData.get("details")) : null,
    listingId: String(formData.get("listingId") || "")
  };

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const userId = getCurrentUserId();
  await prisma.report.create({
    data: {
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
      listingId: parsed.data.listingId,
      reporterId: userId
    }
  });

  revalidatePath(`/marketplace/${parsed.data.listingId}`);
  revalidatePath("/admin/moderation");
}

export async function updateReportStatus(reportId: string, status: string) {
  await prisma.report.update({
    where: { id: reportId },
    data: { status: status as "OPEN" | "UNDER_REVIEW" | "RESOLVED" }
  });

  revalidatePath("/admin/moderation");
}
