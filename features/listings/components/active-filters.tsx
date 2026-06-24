"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { ROUTES, LISTING_CONDITION_LABELS } from "@/lib/constants";
import { formatPrice } from "@/utils/format";
import type { BrandItem, CategoryItem, ListingFilters } from "@/types/marketplace";
import { useListingHref } from "@/features/listings/hooks/use-listing-href";

interface Props {
  filters: ListingFilters;
  categories: CategoryItem[];
  brands: BrandItem[];
}

export function ActiveFilters({ filters, categories, brands }: Props) {
  const buildHref = useListingHref();

  const chips: Array<{ label: string; patch: Record<string, null> }> = [];

  if (filters.q) chips.push({ label: `“${filters.q}”`, patch: { q: null } });
  if (filters.category) {
    const name = categories.find((c) => c.slug === filters.category)?.name ?? filters.category;
    chips.push({ label: name, patch: { category: null } });
  }
  if (filters.brand) {
    const name = brands.find((b) => b.slug === filters.brand)?.name ?? filters.brand;
    chips.push({ label: name, patch: { brand: null } });
  }
  if (filters.condition) {
    chips.push({ label: LISTING_CONDITION_LABELS[filters.condition], patch: { condition: null } });
  }
  if (filters.city) chips.push({ label: filters.city, patch: { city: null } });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "Any";
    const max = filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "Any";
    chips.push({ label: `${min} – ${max}`, patch: { minPrice: null, maxPrice: null } });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={buildHref(chip.patch)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
        >
          {chip.label}
          <X className="size-3" />
        </Link>
      ))}
      <Link
        href={ROUTES.marketplace}
        className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
