"use client";

import { useRouter } from "next/navigation";

import type { ListingSort } from "@/types/marketplace";
import { LISTING_SORTS, SORT_LABELS } from "@/features/listings/schemas/filters";
import { useListingHref } from "@/features/listings/hooks/use-listing-href";

export function SortSelect({ value }: { value: ListingSort }) {
  const router = useRouter();
  const buildHref = useListingHref();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={(e) => router.push(buildHref({ sort: e.target.value }))}
        aria-label="Sort listings"
        className="border-input bg-background h-9 rounded-md border px-2 text-sm"
      >
        {LISTING_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </select>
    </label>
  );
}
