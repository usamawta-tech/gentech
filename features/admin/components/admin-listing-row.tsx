"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  type ListingStatus,
} from "@/lib/constants";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListingStatusBadge } from "@/features/seller/components/listing-status-badge";
import type { AdminListingRow as AdminListingRowData } from "@/features/admin/types";
import {
  adminDeleteListingAction,
  adminSetListingStatusAction,
} from "@/features/admin/actions/admin.actions";

const STATUS_OPTIONS: ListingStatus[] = [
  LISTING_STATUSES.ACTIVE,
  LISTING_STATUSES.SOLD,
  LISTING_STATUSES.DRAFT,
  LISTING_STATUSES.EXPIRED,
];

export function AdminListingRow({ listing }: { listing: AdminListingRowData }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, message: string) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Action failed.");
      return;
    }
    toast.success(message);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <Link
          href={`/listings/${listing.slug}`}
          className="hover:text-primary line-clamp-1 font-medium"
        >
          {listing.title}
        </Link>
        <p className="text-muted-foreground truncate text-xs">
          {listing.sellerName} · {listing.city}
        </p>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <ListingStatusBadge status={listing.status} />
          <span className="text-foreground font-semibold">
            {formatPrice(listing.price, { currency: listing.currency })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {listing.views.toLocaleString()}
          </span>
          <span>{formatRelativeTime(listing.createdAt)}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label={`Actions for ${listing.title}`}
              disabled={pending}
            />
          }
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/listings/${listing.slug}`} />}>
            <Eye className="size-4" />
            View listing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Set status</DropdownMenuLabel>
          {STATUS_OPTIONS.filter((s) => s !== listing.status).map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() =>
                run(
                  () => adminSetListingStatusAction({ listingId: listing.id, status }),
                  `Status set to ${LISTING_STATUS_LABELS[status]}`,
                )
              }
            >
              {LISTING_STATUS_LABELS[status]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (!window.confirm("Remove this listing? This soft-deletes it.")) return;
              void run(
                () => adminDeleteListingAction({ listingId: listing.id }),
                "Listing removed",
              );
            }}
          >
            <Trash2 className="size-4" />
            Remove listing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
