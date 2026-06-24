"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import {
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/services/notification.service";

/** Marks one notification read for the current user. */
export async function markNotificationReadAction(id: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  try {
    await markNotificationRead(user.id, id);
    revalidatePath(ROUTES.notifications);
    return { ok: true };
  } catch (error) {
    console.error("[notifications] markRead failed:", error);
    return { ok: false };
  }
}

/** Marks all notifications read for the current user. */
export async function markAllNotificationsReadAction(): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  try {
    await markAllNotificationsRead(user.id);
    revalidatePath(ROUTES.notifications);
    return { ok: true };
  } catch (error) {
    console.error("[notifications] markAllRead failed:", error);
    return { ok: false };
  }
}

/** Lightweight poll for the bell badge. */
export async function getUnreadCountAction(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return getUnreadNotificationCount(user.id);
}
