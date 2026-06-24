import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { NotificationType } from "@/lib/constants";
import type { NotificationDto } from "@/features/notifications/types";

const select = {
  id: true,
  type: true,
  title: true,
  body: true,
  data: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

type NotificationRow = Prisma.NotificationGetPayload<{ select: typeof select }>;

/** Extracts a `url` string from the notification's JSON payload, if present. */
function urlFromData(data: Prisma.JsonValue | null): string | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const url = (data as Record<string, unknown>).url;
    if (typeof url === "string") return url;
  }
  return null;
}

function toDto(row: NotificationRow): NotificationDto {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    url: urlFromData(row.data),
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  const data: Prisma.InputJsonValue | undefined =
    input.url || input.data
      ? ({ ...(input.data ?? {}), ...(input.url ? { url: input.url } : {}) } as Prisma.InputJsonValue)
      : undefined;

  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data,
    },
  });
}

/** Recent notifications for the user, newest first. */
export async function listNotifications(userId: string, limit = 30): Promise<NotificationDto[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select,
  });
  return rows.map(toDto);
}

export async function countUnread(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

/** Marks a single notification read (owner-scoped). */
export async function markRead(userId: string, id: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

/** Marks all of a user's notifications read. */
export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

/** Looks up a user's email + name for out-of-band delivery (email channel). */
export async function getUserContact(
  userId: string,
): Promise<{ email: string; name: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  return user ? { email: user.email, name: user.name } : null;
}
