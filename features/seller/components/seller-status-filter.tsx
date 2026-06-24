import Link from "next/link";

import { LISTING_STATUSES, ROUTES, type ListingStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FilterTab {
  label: string;
  status?: ListingStatus;
}

const TABS: FilterTab[] = [
  { label: "All" },
  { label: "Active", status: LISTING_STATUSES.ACTIVE },
  { label: "Sold", status: LISTING_STATUSES.SOLD },
  { label: "Drafts", status: LISTING_STATUSES.DRAFT },
];

/** URL-driven status tabs for the seller's listings (server-rendered links). */
export function SellerStatusFilter({ active }: { active?: ListingStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const href = tab.status
          ? `${ROUTES.myListings}?status=${tab.status}`
          : ROUTES.myListings;
        const isActive = tab.status === active || (!tab.status && !active);
        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-transparent"
                : "hover:bg-accent text-muted-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
