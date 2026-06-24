import type { ListingCondition } from "@/lib/constants";

/** Lightweight category for nav/grid display. */
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  /** lucide icon name (resolved in the UI). */
  icon?: string;
  count?: number;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
}

/** View-model for a listing card. Mirrors what a DB query projects. */
export interface ListingCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency?: string;
  condition: ListingCondition;
  city: string;
  brand?: string;
  brandSlug?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  negotiable?: boolean;
  views?: number;
  /** ISO timestamp. */
  createdAt: string;
  /** Optional image URL; when absent the card renders a branded gradient tile. */
  imageUrl?: string;
}

/** Sort options for the marketplace feed. */
export type ListingSort = "recent" | "price_asc" | "price_desc" | "popular";

/** Normalised marketplace filter set (parsed from URL search params). */
export interface ListingFilters {
  q?: string;
  category?: string;
  brand?: string;
  condition?: ListingCondition;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ListingSort;
  page: number;
  pageSize: number;
}

/** A page of listings plus metadata for pagination UI. */
export interface ListingSearchResult {
  items: ListingCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** A single image for the detail gallery. */
export interface ListingImageData {
  url: string;
  width?: number;
  height?: number;
}

/** A formatted attribute row for the specs table. */
export interface AttributePair {
  label: string;
  value: string;
}

/** The seller summary shown on a listing detail page. */
export interface ListingSeller {
  id?: string;
  name: string;
  image?: string | null;
  city?: string;
  /** ISO timestamp of account creation. */
  memberSince?: string;
  rating?: number;
  reviewCount?: number;
}

/** Full view-model for the listing detail page. */
export interface ListingDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  condition: ListingCondition;
  negotiable: boolean;
  city: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  brand?: string;
  brandSlug?: string;
  categorySlug?: string;
  categoryName?: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  images: ListingImageData[];
  attributes: AttributePair[];
  seller: ListingSeller;
  videoUrl?: string;
}
