"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import type { ConversationThread } from "@/features/messaging/types";
import { useMessageThread } from "@/features/messaging/hooks/use-message-thread";
import { MessageBubble } from "@/features/messaging/components/message-bubble";
import { MessageComposer } from "@/features/messaging/components/message-composer";
import {
  markReadAction,
  sendMessageAction,
} from "@/features/messaging/actions/messaging.actions";

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

export function MessageThread({ thread }: { thread: ConversationThread }) {
  const { messages, lastReadAt, otherTyping, appendOwnMessage, signalTyping } = useMessageThread({
    conversationId: thread.id,
    initialMessages: thread.messages,
  });

  const bottomRef = React.useRef<HTMLDivElement>(null);
  const { otherParty, listing } = thread;

  // Mark the other party's messages read on mount and whenever a new inbound arrives.
  const lastInboundId = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message && message.senderId !== thread.me) return message.id;
    }
    return null;
  }, [messages, thread.me]);

  React.useEffect(() => {
    void markReadAction(thread.id);
  }, [thread.id, lastInboundId]);

  // Keep the latest message in view.
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  // The createdAt of my newest message — used to decide if it's been "Seen".
  const myLastSentAt = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message && message.senderId === thread.me) return message.createdAt;
    }
    return null;
  }, [messages, thread.me]);

  async function handleSend(input: { body?: string; imageUrl?: string }): Promise<boolean> {
    const result = await sendMessageAction({ conversationId: thread.id, ...input });
    if (!result.ok) return false;
    appendOwnMessage(result.message);
    return true;
  }

  return (
    <div className="flex h-[calc(100svh-8.5rem)] flex-col overflow-hidden rounded-xl border">
      {/* Header */}
      <header className="bg-card flex items-center gap-3 border-b p-3">
        <Link
          href={ROUTES.messages}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Avatar className="size-9">
          {otherParty.image ? <AvatarImage src={otherParty.image} alt={otherParty.name} /> : null}
          <AvatarFallback>{initials(otherParty.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{otherParty.name}</p>
          {otherTyping ? (
            <p className="text-primary text-xs">typing…</p>
          ) : listing ? (
            <Link
              href={`/listings/${listing.slug}`}
              className="text-muted-foreground hover:text-foreground truncate text-xs"
            >
              {listing.title}
            </Link>
          ) : null}
        </div>
      </header>

      {/* Messages */}
      <div className="bg-muted/30 flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === thread.me;
            const seen =
              isOwn &&
              message.createdAt === myLastSentAt &&
              Boolean(lastReadAt && lastReadAt >= message.createdAt);
            return (
              <MessageBubble key={message.id} message={message} isOwn={isOwn} seen={seen} />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={handleSend} onTyping={signalTyping} />
    </div>
  );
}
