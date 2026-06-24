import { z } from "zod";

import { PAGINATION } from "@/lib/constants";
import type { ListingFilters } from "@/types/marketplace";

export const LISTING_SORTS = ["recent", "price_asc", "price_desc", "popular"] as const;

export const SORT_LABELS: Record<(typeof LISTING_SORTS)[number], string> = {
  recent: "Newest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  popular: "Most popular",
};

/**
 * Parses raw URL search params into a normalised, validated filter set.
 * Unknown/invalid values fall back to safe defaults (`.catch`) rather than throwing,
 * so a hand-edited URL never 500s the marketplace.
 */
const schema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  category: z.string().trim().min(1).optional().catch(undefined),
  brand: z.string().trim().min(1).optional().catch(undefined),
  condition: z
    .enum(["NEW", "OPEN_BOX", "USED", "REFURBISHED", "FOR_PARTS"])
    .optional()
    .catch(undefined),
  city: z.string().trim().min(1).optional().catch(undefined),
  minPrice: z.coerce.number().int().nonnegative().optional().catch(undefined),
  maxPrice: z.coerce.number().int().positive().optional().catch(undefined),
  sort: z.enum(LISTING_SORTS).catch("recent"),
  page: z.coerce.number().int().min(1).catch(1),
});

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Take the first value when a param arrives as an array. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingFilters(raw: RawSearchParams): ListingFilters {
  const parsed = schema.parse({
    q: first(raw.q),
    category: first(raw.category),
    brand: first(raw.brand),
    condition: first(raw.condition),
    city: first(raw.city),
    minPrice: first(raw.minPrice),
    maxPrice: first(raw.maxPrice),
    sort: first(raw.sort),
    page: first(raw.page),
  });

  // Guard against an inverted price range.
  const minPrice = parsed.minPrice;
  const maxPrice =
    parsed.maxPrice !== undefined && minPrice !== undefined && parsed.maxPrice < minPrice
      ? undefined
      : parsed.maxPrice;

  return {
    ...parsed,
    minPrice,
    maxPrice,
    pageSize: PAGINATION.defaultPageSize,
  };
}
