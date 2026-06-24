import "server-only";

import type { NotificationType } from "@/lib/constants";
import type { NotificationDto } from "@/features/notifications/types";
import {
  countUnread,
  createNotification,
  getUserContact,
  listNotifications,
  markAllRead,
  markRead,
} from "@/features/notifications/repositories/notification.repository";
import { externalChannels } from "@/features/notifications/lib/channels";

export interface DispatchInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, unknown>;
  /** Also deliver by email (best-effort, only if configured + user has an email). */
  email?: boolean;
}

/**
 * Central notification entry point. Persists the in-app notification, then fans out
 * to external channels (email now, push later). Best-effort: failures are logged but
 * never bubble up to the triggering action (sending a message must not fail because
 * an email bounced).
 */
export async function dispatchNotification(input: DispatchInput): Promise<void> {
  try {
    await createNotification({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      url: input.url,
      data: input.data,
    });
  } catch (error) {
    console.error("[notifications] failed to persist:", error);
    return; // if we can't store it, don't bother with external channels
  }

  const contact = input.email ? await getUserContact(input.userId).catch(() => null) : null;

  await Promise.allSettled(
    externalChannels.map((channel) =>
      channel.deliver({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        url: input.url,
        email: input.email,
        recipientEmail: contact?.email,
        recipientName: contact?.name,
      }),
    ),
  );
}

/** Recent notifications for a user. Empty list if the database is unavailable. */
export async function getNotifications(userId: string, limit?: number): Promise<NotificationDto[]> {
  try {
    return await listNotifications(userId, limit);
  } catch (error) {
    console.warn(
      "[notifications] could not load.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/** Unread count for the bell badge. 0 on any failure. */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await countUnread(userId);
  } catch {
    return 0;
  }
}

export async function markNotificationRead(userId: string, id: string): Promise<void> {
  await markRead(userId, id);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await markAllRead(userId);
}
