import "server-only";

import {
  listSavedSearches,
  type SavedSearchItem,
} from "../repositories/saved-search.repository";

/** A user's saved searches. Returns an empty list if the database is unavailable. */
export async function getSavedSearches(userId: string): Promise<SavedSearchItem[]> {
  try {
    return await listSavedSearches(userId);
  } catch {
    return [];
  }
}
