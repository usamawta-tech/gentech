"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Heart,
  Loader2,
  MoreVertical,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { LISTING_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SellerListingRow } from "@/features/seller/types";
import { ListingStatusBadge } from "@/features/seller/components/listing-status-badge";
import {
  deleteListingAction,
  markListingActiveAction,
  markListingSoldAction,
} from "@/features/seller/actions/seller.actions";

export function SellerListingCard({ listing }: { listing: SellerListingRow }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: string,
  ) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Action failed.");
      return;
    }
    toast.success(successMessage);
    router.refresh();
  }

  const isActive = listing.status === LISTING_STATUSES.ACTIVE;
  const isSold = listing.status === LISTING_STATUSES.SOLD;

  return (
    <article className="bg-card flex gap-3 rounded-xl border p-3">
      <Link
        href={`/listings/${listing.slug}`}
        className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg"
      >
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="text-muted-foreground grid h-full place-items-center">
            <Smartphone className="size-7" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/listings/${listing.slug}`}
            className="hover:text-primary line-clamp-1 font-medium"
          >
            {listing.title}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  aria-label="Listing actions"
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

              {!isSold ? (
                <DropdownMenuItem
                  onClick={() =>
                    run(
                      () => markListingSoldAction({ listingId: listing.id }),
                      "Marked as sold",
                    )
                  }
                >
                  <ShoppingBag className="size-4" />
                  Mark as sold
                </DropdownMenuItem>
              ) : null}

              {!isActive ? (
                <DropdownMenuItem
                  onClick={() =>
                    run(
                      () => markListingActiveAction({ listingId: listing.id }),
                      "Listing is active again",
                    )
                  }
                >
                  <RotateCcw className="size-4" />
                  {isSold ? "Relist" : "Mark active"}
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  if (!window.confirm("Delete this listing? This can't be undone.")) return;
                  void run(() => deleteListingAction({ listingId: listing.id }), "Listing deleted");
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-primary mt-0.5 font-bold">
          {formatPrice(listing.price, { currency: listing.currency })}
        </p>

        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <ListingStatusBadge status={listing.status} />
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {listing.views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" />
            {listing.favorites.toLocaleString()}
          </span>
          <span className={cn("ml-auto")}>
            {isSold && listing.soldAt
              ? `Sold ${formatRelativeTime(listing.soldAt)}`
              : formatRelativeTime(listing.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
