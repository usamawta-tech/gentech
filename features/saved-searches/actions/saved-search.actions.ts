"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { buildSearchLabel } from "../lib/label";
import {
  createSavedSearch,
  deleteSavedSearch,
} from "../repositories/saved-search.repository";

const saveSchema = z.object({ query: z.string().trim().max(500) });

export async function saveSearchAction(input: {
  query: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save searches." };

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid search." };

  // Normalise: drop pagination so re-running starts at page 1.
  const params = new URLSearchParams(parsed.data.query);
  params.delete("page");
  const query = params.toString();

  try {
    await createSavedSearch(user.id, { query, name: buildSearchLabel(query) });
    revalidatePath(ROUTES.savedSearches);
    return { ok: true };
  } catch (error) {
    console.error("[saved-search] save failed:", error);
    return { ok: false, error: "Could not save this search." };
  }
}

export async function deleteSavedSearchAction(id: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  try {
    await deleteSavedSearch(user.id, id);
    revalidatePath(ROUTES.savedSearches);
    return { ok: true };
  } catch (error) {
    console.error("[saved-search] delete failed:", error);
    return { ok: false };
  }
}
