import type { NotificationType } from "@/lib/constants";

/** A user-facing notification (in-app inbox + bell dropdown). */
export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  /** Deep link to the relevant page (e.g. a conversation), if any. */
  url: string | null;
  /** ISO timestamp when read, else null. */
  readAt: string | null;
  /** ISO timestamp. */
  createdAt: string;
}
