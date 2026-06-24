"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { trackStartChat } from "@/features/analytics/lib/events";
import { startConversationAction } from "@/features/messaging/actions/messaging.actions";

/**
 * Contact actions on a listing. "Chat with seller" opens (or reuses) a conversation
 * and navigates to the thread; guests are routed to sign-in first.
 */
export function ContactSeller({
  listingId,
  isAuthenticated,
}: {
  listingId: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [starting, setStarting] = React.useState(false);

  async function handleChat() {
    if (!isAuthenticated) {
      router.push(ROUTES.signIn);
      return;
    }
    setStarting(true);
    trackStartChat(listingId);
    const result = await startConversationAction({ listingId });
    if (!result.ok) {
      setStarting(false);
      toast.error(result.error);
      return;
    }
    router.push(`${ROUTES.messages}/${result.conversationId}`);
  }

  function handlePhone() {
    if (!isAuthenticated) {
      router.push(ROUTES.signIn);
      return;
    }
    toast.info("Start a chat to request the seller's phone number.");
  }

  return (
    <div className="grid gap-2">
      <Button onClick={handleChat} disabled={starting} className="w-full">
        {starting ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
        Chat with seller
      </Button>
      <Button variant="outline" onClick={handlePhone} className="w-full">
        <Phone className="size-4" />
        Show phone number
      </Button>
    </div>
  );
}
