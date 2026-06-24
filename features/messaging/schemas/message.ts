import { z } from "zod";

/** Validates an outgoing message: text, an image, or both — but never empty. */
export const sendMessageSchema = z
  .object({
    conversationId: z.string().min(1, "Missing conversation."),
    body: z.string().trim().max(2000).optional(),
    imageUrl: z.string().url().max(2048).optional(),
  })
  .refine((data) => Boolean(data.body && data.body.length > 0) || Boolean(data.imageUrl), {
    message: "Type a message or attach an image.",
    path: ["body"],
  });

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/** Validates a request to start (or reuse) a conversation about a listing. */
export const startConversationSchema = z.object({
  listingId: z.string().min(1, "Missing listing."),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
