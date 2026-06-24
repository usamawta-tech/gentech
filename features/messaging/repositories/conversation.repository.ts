import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  ConversationSummary,
  ConversationThread,
  MessageDto,
} from "@/features/messaging/types";

/** Projection for the other party (or self) in a conversation. */
const partySelect = { id: true, name: true, image: true } satisfies Prisma.UserSelect;

/** Projection for the listing a conversation is about, incl. its primary image. */
const listingSelect = {
  id: true,
  title: true,
  slug: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ListingSelect;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  body: true,
  imageUrl: true,
  createdAt: true,
  readAt: true,
} satisfies Prisma.MessageSelect;

type MessageRow = Prisma.MessageGetPayload<{ select: typeof messageSelect }>;
type ListingRow = Prisma.ListingGetPayload<{ select: typeof listingSelect }>;

function toMessageDto(row: MessageRow): MessageDto {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    body: row.body,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt ? row.readAt.toISOString() : null,
  };
}

function toListingDto(listing: ListingRow | null) {
  if (!listing) return null;
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    imageUrl: listing.images[0]?.url ?? null,
  };
}

/**
 * Finds the existing buyer↔seller conversation for a listing, or creates one.
 * A seller cannot open a conversation with themselves (guarded in the service).
 */
export async function getOrCreateConversation(params: {
  listingId: string;
  buyerId: string;
  sellerId: string;
}): Promise<string> {
  const existing = await prisma.conversation.findFirst({
    where: {
      listingId: params.listingId,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: {
      listingId: params.listingId,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
    },
    select: { id: true },
  });
  return created.id;
}

/** All of a user's conversations (as buyer or seller), most-recently-active first. */
export async function listConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  const rows = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      buyerId: true,
      updatedAt: true,
      buyer: { select: partySelect },
      seller: { select: partySelect },
      listing: { select: listingSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, imageUrl: true, createdAt: true, senderId: true },
      },
    },
  });

  if (rows.length === 0) return [];

  // Unread counts for all conversations in one grouped query (messages the user
  // did NOT send and has not yet read).
  const unreadGroups = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: rows.map((r) => r.id) },
      senderId: { not: userId },
      readAt: null,
    },
    _count: { _all: true },
  });
  const unreadByConversation = new Map(
    unreadGroups.map((g) => [g.conversationId, g._count._all]),
  );

  return rows.map((row) => {
    const otherParty = row.buyerId === userId ? row.seller : row.buyer;
    const last = row.messages[0];
    return {
      id: row.id,
      otherParty: { id: otherParty.id, name: otherParty.name, image: otherParty.image },
      listing: toListingDto(row.listing),
      lastMessage: last
        ? {
            body: last.body,
            imageUrl: last.imageUrl,
            createdAt: last.createdAt.toISOString(),
            senderId: last.senderId,
          }
        : null,
      unreadCount: unreadByConversation.get(row.id) ?? 0,
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

const THREAD_MESSAGE_LIMIT = 100;

/**
 * Loads a conversation thread, scoped to a participant. Returns `null` when the
 * conversation does not exist or the user is neither buyer nor seller (→ 404).
 */
export async function getConversationForUser(
  conversationId: string,
  userId: string,
): Promise<ConversationThread | null> {
  const row = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    select: {
      id: true,
      buyerId: true,
      buyer: { select: partySelect },
      seller: { select: partySelect },
      listing: { select: listingSelect },
      messages: {
        orderBy: { createdAt: "asc" },
        take: THREAD_MESSAGE_LIMIT,
        select: messageSelect,
      },
    },
  });
  if (!row) return null;

  const otherParty = row.buyerId === userId ? row.seller : row.buyer;
  return {
    id: row.id,
    me: userId,
    otherParty: { id: otherParty.id, name: otherParty.name, image: otherParty.image },
    listing: toListingDto(row.listing),
    messages: row.messages.map(toMessageDto),
  };
}

/**
 * Resolves who to notify about a new message: the other participant's id plus the
 * sender's display name. Returns `null` if the conversation/sender can't be found.
 */
export async function getMessageNotificationTarget(
  conversationId: string,
  senderId: string,
): Promise<{ recipientId: string; senderName: string } | null> {
  const row = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      buyerId: true,
      sellerId: true,
      buyer: { select: { name: true } },
      seller: { select: { name: true } },
    },
  });
  if (!row) return null;

  const isBuyerSender = row.buyerId === senderId;
  const recipientId = isBuyerSender ? row.sellerId : row.buyerId;
  const senderName = isBuyerSender ? row.buyer.name : row.seller.name;
  if (recipientId === senderId) return null;
  return { recipientId, senderName };
}

/** Confirms the user participates in the conversation (authorization helper). */
export async function isParticipant(conversationId: string, userId: string): Promise<boolean> {
  const row = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    select: { id: true },
  });
  return Boolean(row);
}

/** Persists a message and bumps the conversation's `lastMessageAt`. */
export async function createMessage(input: {
  conversationId: string;
  senderId: string;
  body?: string;
  imageUrl?: string;
}): Promise<MessageDto> {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: input.senderId,
        body: input.body,
        imageUrl: input.imageUrl,
      },
      select: messageSelect,
    }),
    prisma.conversation.update({
      where: { id: input.conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);
  return toMessageDto(message);
}

/** Marks every message the *other* party sent in this conversation as read. */
export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
}

/**
 * Messages created strictly after `since` (both senders) plus the newest readAt
 * across messages the user sent. Powers incremental polling for an open thread.
 */
export async function getThreadDelta(
  conversationId: string,
  userId: string,
  since: Date,
): Promise<{ messages: MessageDto[]; lastReadAt: string | null }> {
  const [rows, readAgg] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId, createdAt: { gt: since } },
      orderBy: { createdAt: "asc" },
      select: messageSelect,
    }),
    prisma.message.aggregate({
      where: { conversationId, senderId: userId, readAt: { not: null } },
      _max: { readAt: true },
    }),
  ]);

  return {
    messages: rows.map(toMessageDto),
    lastReadAt: readAgg._max.readAt ? readAgg._max.readAt.toISOString() : null,
  };
}

/** Total unread messages across all of a user's conversations (header badge). */
export async function countUnreadForUser(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      senderId: { not: userId },
      readAt: null,
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}
