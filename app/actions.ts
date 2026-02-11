"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { listingSchema, messageSchema } from "@/lib/validators";

type ActionState = {
  error: string | null;
};

export async function createListingAction(_: ActionState, formData: FormData): Promise<ActionState> {
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
    imageUrl: formData.get("imageUrl")
      ? String(formData.get("imageUrl"))
      : null
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
      userId,
      images: parsed.data.imageUrl
        ? { create: [{ url: parsed.data.imageUrl }] }
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
