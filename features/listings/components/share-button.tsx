"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled the share sheet */
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link");
    }
  }

  return (
    <Button variant="outline" size="icon" aria-label="Share listing" onClick={share}>
      <Share2 className="size-4" />
    </Button>
  );
}
