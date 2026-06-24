import "server-only";

/**
 * Best-effort, in-memory typing presence.
 *
 * Typing state is ephemeral and not worth persisting, so it lives in a module-level
 * map with a short TTL. This is authoritative only within a single server instance —
 * across a multi-instance/serverless deployment it degrades gracefully (the indicator
 * may simply not show). The real-time WebSocket transport (Phase 6 decision: realtime
 * behind an interface) will supersede this with cross-instance presence.
 */

const TYPING_TTL_MS = 6000;

/** conversationId → (userId → expiry epoch ms) */
const typingByConversation = new Map<string, Map<string, number>>();

/** Records that `userId` is typing in `conversationId` for the next few seconds. */
export function markTyping(conversationId: string, userId: string): void {
  let users = typingByConversation.get(conversationId);
  if (!users) {
    users = new Map();
    typingByConversation.set(conversationId, users);
  }
  users.set(userId, Date.now() + TYPING_TTL_MS);
}

/** Whether anyone other than `excludeUserId` is currently typing in the conversation. */
export function isOtherTyping(conversationId: string, excludeUserId: string): boolean {
  const users = typingByConversation.get(conversationId);
  if (!users) return false;

  const now = Date.now();
  let active = false;
  for (const [userId, expiresAt] of users) {
    if (expiresAt <= now) {
      users.delete(userId); // opportunistic cleanup
    } else if (userId !== excludeUserId) {
      active = true;
    }
  }
  if (users.size === 0) typingByConversation.delete(conversationId);
  return active;
}
