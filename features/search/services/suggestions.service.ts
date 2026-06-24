import "server-only";

import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_LISTINGS,
} from "@/features/marketplace/data/fixtures";
import { suggestListings } from "@/features/listings/repositories/listing.repository";

export interface SearchSuggestions {
  listings: Array<{ title: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
  brands: Array<{ name: string; slug: string }>;
}

const EMPTY: SearchSuggestions = { listings: [], categories: [], brands: [] };

/** Grouped autocomplete suggestions for a query. Requires ≥ 2 characters. */
export async function getSearchSuggestions(q: string): Promise<SearchSuggestions> {
  const term = q.trim();
  if (term.length < 2) return EMPTY;
  const lower = term.toLowerCase();

  const categories = DEMO_CATEGORIES.filter((c) => c.name.toLowerCase().includes(lower))
    .slice(0, 4)
    .map((c) => ({ name: c.name, slug: c.slug }));

  const brands = DEMO_BRANDS.filter((b) => b.name.toLowerCase().includes(lower))
    .slice(0, 4)
    .map((b) => ({ name: b.name, slug: b.slug }));

  let listings: SearchSuggestions["listings"];
  try {
    listings = await suggestListings(term);
  } catch {
    listings = DEMO_LISTINGS.filter((l) => l.title.toLowerCase().includes(lower))
      .slice(0, 6)
      .map((l) => ({ title: l.title, slug: l.slug }));
  }

  return { listings, categories, brands };
}
