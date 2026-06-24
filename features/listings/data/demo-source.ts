import { DEMO_LISTINGS } from "@/features/marketplace/data/fixtures";
import type { ListingCardData, ListingFilters, ListingSearchResult } from "@/types/marketplace";

/**
 * In-memory listing search over demo fixtures. Mirrors the semantics of the Prisma
 * repository so the marketplace is fully interactive without a database connected.
 */
export function searchDemoListings(filters: ListingFilters): ListingSearchResult {
  const q = filters.q?.toLowerCase();

  let items = DEMO_LISTINGS.filter((l) => {
    if (q && !`${l.title} ${l.brand ?? ""}`.toLowerCase().includes(q)) return false;
    if (filters.category && l.categorySlug !== filters.category) return false;
    if (filters.brand && l.brandSlug !== filters.brand) return false;
    if (filters.condition && l.condition !== filters.condition) return false;
    if (filters.city && l.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.minPrice !== undefined && l.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && l.price > filters.maxPrice) return false;
    return true;
  });

  items = sortListings(items, filters.sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * filters.pageSize;
  const pageItems = items.slice(start, start + filters.pageSize);

  return { items: pageItems, total, page, pageSize: filters.pageSize, totalPages };
}

function sortListings(items: ListingCardData[], sort: ListingFilters["sort"]): ListingCardData[] {
  const copy = [...items];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price_desc":
      return copy.sort((a, b) => b.price - a.price);
    case "popular":
      return copy.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    case "recent":
    default:
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
