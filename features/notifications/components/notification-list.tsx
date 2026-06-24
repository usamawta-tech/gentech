"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import type { NotificationDto } from "@/features/notifications/types";
import { NotificationIcon } from "@/features/notifications/components/notification-icon";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions/notification.actions";

export function NotificationList({ items }: { items: NotificationDto[] }) {
  const router = useRouter();
  const hasUnread = items.some((i) => !i.readAt);

  async function open(item: NotificationDto) {
    if (!item.readAt) {
      await markNotificationReadAction(item.id);
      router.refresh();
    }
  }

  async function markAll() {
    await markAllNotificationsReadAction();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {hasUnread ? (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAll}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>
      ) : null}

      <ul className="divide-y rounded-xl border">
        {items.map((item) => {
          const Row = (
            <>
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full",
                  item.readAt ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                )}
              >
                <NotificationIcon type={item.type} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.title}</span>
                {item.body ? (
                  <span className="text-muted-foreground block text-sm">{item.body}</span>
                ) : null}
                <span className="text-muted-foreground block text-xs">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </span>
              {!item.readAt ? (
                <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
              ) : null}
            </>
          );

          const className = cn(
            "flex items-start gap-3 p-4 transition-colors",
            !item.readAt && "bg-accent/30",
          );

          return (
            <li key={item.id}>
              {item.url ? (
                <Link href={item.url} onClick={() => open(item)} className={cn(className, "hover:bg-accent")}>
                  {Row}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => open(item)}
                  className={cn(className, "w-full text-left hover:bg-accent")}
                >
                  {Row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
