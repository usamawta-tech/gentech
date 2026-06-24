import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ConversationSummary } from "@/features/messaging/types";

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

function previewText(summary: ConversationSummary): string {
  const last = summary.lastMessage;
  if (!last) return "No messages yet";
  if (last.body) return last.body;
  if (last.imageUrl) return "📷 Photo";
  return "";
}

/** The conversations sidebar/list. `activeId` highlights the open thread. */
export function ConversationList({
  conversations,
  activeId,
}: {
  conversations: ConversationSummary[];
  activeId?: string;
}) {
  return (
    <ul className="divide-y">
      {conversations.map((c) => {
        const unread = c.unreadCount > 0;
        return (
          <li key={c.id}>
            <Link
              href={`${ROUTES.messages}/${c.id}`}
              className={cn(
                "hover:bg-accent flex items-center gap-3 p-3 transition-colors",
                activeId === c.id && "bg-accent",
              )}
            >
              <Avatar className="size-11 shrink-0">
                {c.otherParty.image ? (
                  <AvatarImage src={c.otherParty.image} alt={c.otherParty.name} />
                ) : null}
                <AvatarFallback>{initials(c.otherParty.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate", unread ? "font-semibold" : "font-medium")}>
                    {c.otherParty.name}
                  </p>
                  {c.lastMessage ? (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatRelativeTime(c.lastMessage.createdAt)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      unread ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {previewText(c)}
                  </p>
                  {unread ? (
                    <span className="bg-primary text-primary-foreground grid min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-xs font-medium">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </div>
                {c.listing ? (
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    Re: {c.listing.title}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
