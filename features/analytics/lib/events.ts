import { track } from "@/features/analytics/lib/client";

/**
 * Canonical event names + typed helpers. Centralising them keeps event naming
 * consistent across the app (and across vendors) and makes instrumentation greppable.
 */
export const ANALYTICS_EVENTS = {
  SEARCH: "search",
  VIEW_LISTING: "view_listing",
  START_CHAT: "start_chat",
  CREATE_LISTING: "create_listing",
  SAVE_SEARCH: "save_search",
  TOGGLE_FAVORITE: "toggle_favorite",
} as const;

export function trackSearch(query: string, city?: string): void {
  track(ANALYTICS_EVENTS.SEARCH, { query, ...(city ? { city } : {}) });
}

export function trackViewListing(input: {
  id: string;
  title: string;
  price: number;
  category?: string;
}): void {
  track(ANALYTICS_EVENTS.VIEW_LISTING, input);
}

export function trackStartChat(listingId: string): void {
  track(ANALYTICS_EVENTS.START_CHAT, { listingId });
}

export function trackCreateListing(input: { id: string; price: number }): void {
  track(ANALYTICS_EVENTS.CREATE_LISTING, input);
}

export function trackSaveSearch(query: string): void {
  track(ANALYTICS_EVENTS.SAVE_SEARCH, { query });
}
