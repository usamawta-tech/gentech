import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { LISTING_STATUSES, type ListingStatus } from "@/lib/constants";
import type { SellerListingRow, SellerStats } from "@/features/seller/types";

/** Projection for a seller management row, incl. favorites count + primary image. */
const rowSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  currency: true,
  condition: true,
  city: true,
  status: true,
  views: true,
  isFeatured: true,
  createdAt: true,
  soldAt: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true },
    orderBy: { position: "asc" },
  },
  _count: { select: { favorites: true } },
} satisfies Prisma.ListingSelect;

type SellerListingRecord = Prisma.ListingGetPayload<{ select: typeof rowSelect }>;

function toRow(row: SellerListingRecord): SellerListingRow {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    city: row.city ?? "—",
    status: row.status,
    views: row.views,
    favorites: row._count.favorites,
    isFeatured: row.isFeatured,
    imageUrl: row.images[0]?.url,
    createdAt: row.createdAt.toISOString(),
    soldAt: row.soldAt ? row.soldAt.toISOString() : undefined,
  };
}

/** Aggregate stats across a seller's (non-deleted) listings, in a few grouped queries. */
export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  const baseWhere: Prisma.ListingWhereInput = { sellerId, deletedAt: null };

  const [statusGroups, viewsAgg, favorites] = await Promise.all([
    prisma.listing.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.listing.aggregate({ where: baseWhere, _sum: { views: true } }),
    prisma.favorite.count({ where: { listing: { sellerId, deletedAt: null } } }),
  ]);

  const countByStatus = new Map<ListingStatus, number>(
    statusGroups.map((g) => [g.status, g._count._all]),
  );
  const totalListings = statusGroups.reduce((sum, g) => sum + g._count._all, 0);

  return {
    totalListings,
    activeListings: countByStatus.get(LISTING_STATUSES.ACTIVE) ?? 0,
    soldListings: countByStatus.get(LISTING_STATUSES.SOLD) ?? 0,
    totalViews: viewsAgg._sum.views ?? 0,
    totalFavorites: favorites,
  };
}

/** A seller's listings (optionally filtered by status), newest first. */
export async function getSellerListings(
  sellerId: string,
  status?: ListingStatus,
): Promise<SellerListingRow[]> {
  const rows = await prisma.listing.findMany({
    where: { sellerId, deletedAt: null, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    select: rowSelect,
  });
  return rows.map(toRow);
}

/**
 * Updates a listing's status, scoped to its owner. Sets/clears `soldAt` for SOLD/ACTIVE.
 * Returns the number of rows affected (0 ⇒ not found or not owned by the seller).
 */
export async function setListingStatus(
  sellerId: string,
  listingId: string,
  status: ListingStatus,
): Promise<number> {
  const data: Prisma.ListingUpdateManyMutationInput = { status };
  if (status === LISTING_STATUSES.SOLD) data.soldAt = new Date();
  if (status === LISTING_STATUSES.ACTIVE) data.soldAt = null;

  const result = await prisma.listing.updateMany({
    where: { id: listingId, sellerId, deletedAt: null },
    data,
  });
  return result.count;
}

/** Soft-deletes a listing (owner-scoped). Returns rows affected. */
export async function softDeleteListing(
  sellerId: string,
  listingId: string,
): Promise<number> {
  const result = await prisma.listing.updateMany({
    where: { id: listingId, sellerId, deletedAt: null },
    data: { status: LISTING_STATUSES.REMOVED, deletedAt: new Date() },
  });
  return result.count;
}
