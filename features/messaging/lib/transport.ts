import type { ThreadUpdate } from "@/features/messaging/types";
import {
  notifyTypingAction,
  pollThreadAction,
} from "@/features/messaging/actions/messaging.actions";

/**
 * Realtime transport abstraction.
 *
 * Phase 6 decision: realtime chat is designed behind this interface so the
 * transport can evolve (polling → WebSocket) without touching the UI. The polling
 * implementation below works on serverless (Vercel) today; a `WebSocketTransport`
 * can later implement the same contract for instant delivery and live typing.
 */
export interface MessagingTransport {
  /**
   * Subscribe to updates for a conversation. `getSince` returns the ISO timestamp of
   * the newest message the client already has, so the transport only fetches the delta.
   * Returns an unsubscribe function.
   */
  subscribe(
    conversationId: string,
    getSince: () => string,
    onUpdate: (update: ThreadUpdate) => void,
  ): () => void;

  /** Signal that the current user is typing in a conversation. */
  notifyTyping(conversationId: string): void;
}

const DEFAULT_POLL_INTERVAL_MS = 4000;

/** Polling transport: re-fetches the thread delta on a fixed interval. */
export function createPollingTransport(
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
): MessagingTransport {
  return {
    subscribe(conversationId, getSince, onUpdate) {
      let cancelled = false;

      async function tick() {
        if (cancelled) return;
        try {
          const update = await pollThreadAction(conversationId, getSince());
          if (!cancelled) onUpdate(update);
        } catch {
          /* transient failure — the next tick retries */
        }
      }

      const timer = setInterval(tick, intervalMs);
      void tick(); // fetch immediately on subscribe

      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    },

    notifyTyping(conversationId) {
      void notifyTypingAction(conversationId);
    },
  };
}
