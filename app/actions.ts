"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { listingSchema, messageSchema, reportSchema, reviewSchema } from "@/lib/validators";

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
    imageUrls
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
