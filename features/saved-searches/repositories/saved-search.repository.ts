import "server-only";

import { prisma } from "@/lib/prisma";

export interface SavedSearchItem {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

export async function listSavedSearches(userId: string): Promise<SavedSearchItem[]> {
  const rows = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, query: true, createdAt: true },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? "All listings",
    query: row.query ?? "",
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createSavedSearch(
  userId: string,
  data: { query: string; name: string },
): Promise<SavedSearchItem> {
  // Avoid duplicates of the exact same query for a user.
  const existing = await prisma.savedSearch.findFirst({
    where: { userId, query: data.query },
    select: { id: true },
  });

  const row = existing
    ? await prisma.savedSearch.update({
        where: { id: existing.id },
        data: { name: data.name },
        select: { id: true, name: true, query: true, createdAt: true },
      })
    : await prisma.savedSearch.create({
        data: { userId, query: data.query, name: data.name },
        select: { id: true, name: true, query: true, createdAt: true },
      });

  return {
    id: row.id,
    name: row.name ?? "All listings",
    query: row.query ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

/** Deletes a saved search, scoped to its owner. */
export async function deleteSavedSearch(userId: string, id: string): Promise<void> {
  await prisma.savedSearch.deleteMany({ where: { id, userId } });
}
