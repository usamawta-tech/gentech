/** View-models for the messaging feature. Repositories map Prisma rows → these DTOs. */

/** The other person in a conversation (never the current user). */
export interface ConversationParty {
  id: string;
  name: string;
  image: string | null;
}

/** The listing a conversation is about, when still available. */
export interface ConversationListing {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

/** A single chat message. */
export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  imageUrl: string | null;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp when the recipient read it, else null. */
  readAt: string | null;
}

/** A row in the conversations list. */
export interface ConversationSummary {
  id: string;
  otherParty: ConversationParty;
  listing: ConversationListing | null;
  lastMessage: Pick<MessageDto, "body" | "imageUrl" | "createdAt" | "senderId"> | null;
  unreadCount: number;
  /** ISO timestamp used for ordering. */
  updatedAt: string;
}

/** A full conversation thread for the chat view. */
export interface ConversationThread {
  id: string;
  /** The current user's id — lets the UI align bubbles left/right. */
  me: string;
  otherParty: ConversationParty;
  listing: ConversationListing | null;
  messages: MessageDto[];
}

/**
 * An incremental update for an open thread. The polling transport produces these;
 * a future WebSocket transport will emit the same shape (see lib/transport.ts).
 */
export interface ThreadUpdate {
  /** Messages created after the client's last-seen timestamp (either sender). */
  messages: MessageDto[];
  /** Newest readAt across messages the current user sent — drives the "Seen" marker. */
  lastReadAt: string | null;
  /** Whether the other party is currently typing. */
  typing: boolean;
}
