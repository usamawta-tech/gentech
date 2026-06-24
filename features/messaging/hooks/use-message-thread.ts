"use client";

import * as React from "react";

import type { MessageDto, ThreadUpdate } from "@/features/messaging/types";
import {
  createPollingTransport,
  type MessagingTransport,
} from "@/features/messaging/lib/transport";

interface UseMessageThreadOptions {
  conversationId: string;
  initialMessages: MessageDto[];
  /** Defaults to the polling transport; swap for WebSocket later without UI changes. */
  transport?: MessagingTransport;
}

interface UseMessageThreadResult {
  messages: MessageDto[];
  /** ISO readAt of the newest of *my* messages the other party has read. */
  lastReadAt: string | null;
  otherTyping: boolean;
  /** Append a locally-sent message immediately (optimistic UI). */
  appendOwnMessage: (message: MessageDto) => void;
  /** Notify the transport that the current user is typing. */
  signalTyping: () => void;
}

/** Merge incoming messages into the list, de-duplicating by id and keeping order. */
function mergeMessages(existing: MessageDto[], incoming: MessageDto[]): MessageDto[] {
  if (incoming.length === 0) return existing;
  const byId = new Map(existing.map((m) => [m.id, m]));
  for (const message of incoming) byId.set(message.id, message);
  return Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Drives an open chat thread: subscribes to the realtime transport for new messages,
 * read receipts and typing state, and supports optimistic local sends.
 */
export function useMessageThread({
  conversationId,
  initialMessages,
  transport,
}: UseMessageThreadOptions): UseMessageThreadResult {
  const [messages, setMessages] = React.useState<MessageDto[]>(initialMessages);
  const [lastReadAt, setLastReadAt] = React.useState<string | null>(null);
  const [otherTyping, setOtherTyping] = React.useState(false);

  // Keep a ref to the newest timestamp so the transport can request only the delta.
  const latestRef = React.useRef<string>(
    initialMessages.at(-1)?.createdAt ?? new Date(0).toISOString(),
  );
  React.useEffect(() => {
    const newest = messages.at(-1)?.createdAt;
    if (newest && newest > latestRef.current) latestRef.current = newest;
  }, [messages]);

  // A stable transport instance for the lifetime of the hook.
  const transportRef = React.useRef<MessagingTransport>(transport ?? createPollingTransport());

  const handleUpdate = React.useCallback(
    (update: ThreadUpdate) => {
      if (update.messages.length > 0) {
        setMessages((prev) => mergeMessages(prev, update.messages));
      }
      setLastReadAt((prev) =>
        update.lastReadAt && (!prev || update.lastReadAt > prev) ? update.lastReadAt : prev,
      );
      setOtherTyping(update.typing);
    },
    [],
  );

  React.useEffect(() => {
    const unsubscribe = transportRef.current.subscribe(
      conversationId,
      () => latestRef.current,
      handleUpdate,
    );
    return unsubscribe;
  }, [conversationId, handleUpdate]);

  const appendOwnMessage = React.useCallback((message: MessageDto) => {
    setMessages((prev) => mergeMessages(prev, [message]));
  }, []);

  const signalTyping = React.useCallback(() => {
    transportRef.current.notifyTyping(conversationId);
  }, [conversationId]);

  return { messages, lastReadAt, otherTyping, appendOwnMessage, signalTyping };
}
