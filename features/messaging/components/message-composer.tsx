"use client";

import * as React from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

interface MessageComposerProps {
  /** Sends the message; resolves `true` on success so the composer can clear. */
  onSend: (input: { body?: string; imageUrl?: string }) => Promise<boolean>;
  /** Called (throttled) as the user types, to drive the peer's typing indicator. */
  onTyping: () => void;
  disabled?: boolean;
}

const TYPING_SIGNAL_INTERVAL_MS = 3000;

export function MessageComposer({ onSend, onTyping, disabled }: MessageComposerProps) {
  const [body, setBody] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const lastTypingSignal = React.useRef(0);

  const canSend = (body.trim().length > 0 || Boolean(imageUrl)) && !sending && !uploading;

  function handleTyping() {
    const now = Date.now();
    if (now - lastTypingSignal.current > TYPING_SIGNAL_INTERVAL_MS) {
      lastTypingSignal.current = now;
      onTyping();
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const signRes = await fetch("/api/v1/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "messages" }),
      });
      if (!signRes.ok) {
        const data = (await signRes.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error ?? "Image uploads are not available right now.");
        return;
      }
      const sign = (await signRes.json()) as SignResponse;

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sign.apiKey);
      form.append("timestamp", String(sign.timestamp));
      form.append("signature", sign.signature);
      form.append("folder", sign.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        toast.error("Failed to upload image.");
        return;
      }
      const data = (await res.json()) as { secure_url: string };
      setImageUrl(data.secure_url);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit() {
    if (!canSend) return;
    setSending(true);
    const ok = await onSend({
      body: body.trim() || undefined,
      imageUrl: imageUrl ?? undefined,
    });
    setSending(false);
    if (ok) {
      setBody("");
      setImageUrl(null);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <div className="bg-background border-t p-3">
      {imageUrl ? (
        <div className="relative mb-2 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Attachment preview" className="h-20 rounded-lg object-cover" />
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => setImageUrl(null)}
            className="bg-background/90 absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach image"
          className="shrink-0"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        </Button>

        <Textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            handleTyping();
          }}
          onKeyDown={onKeyDown}
          placeholder="Write a message…"
          rows={1}
          disabled={disabled}
          aria-label="Message"
          className={cn("max-h-32 min-h-10 flex-1 resize-none")}
        />

        <Button
          type="button"
          size="icon"
          disabled={!canSend || disabled}
          onClick={() => void submit()}
          aria-label="Send message"
          className="shrink-0"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadImage(file);
        }}
      />
    </div>
  );
}
