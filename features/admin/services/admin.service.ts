import "server-only";

import type { ListingStatus, ReportStatus } from "@/lib/constants";
import type {
  AdminCategoryRow,
  AdminListingRow,
  AdminReportRow,
  AdminUserRow,
  Paginated,
  PlatformStats,
} from "@/features/admin/types";
import {
  getPlatformStats,
  listCategories,
  listCategoryOptions,
  listListings,
  listReports,
  listUsers,
} from "@/features/admin/repositories/admin.repository";

const EMPTY_STATS: PlatformStats = {
  totalUsers: 0,
  newUsers7d: 0,
  totalListings: 0,
  activeListings: 0,
  soldListings: 0,
  openReports: 0,
};

function emptyPage<T>(page: number): Paginated<T> {
  return { items: [], total: 0, page, pageSize: 0, totalPages: 1 };
}

export async function getStats(): Promise<PlatformStats> {
  try {
    return await getPlatformStats();
  } catch (error) {
    console.warn("[admin] stats unavailable.", error instanceof Error ? error.message : error);
    return EMPTY_STATS;
  }
}

export async function getUsers(params: {
  q?: string;
  page: number;
}): Promise<Paginated<AdminUserRow>> {
  try {
    return await listUsers(params);
  } catch (error) {
    console.warn("[admin] users unavailable.", error instanceof Error ? error.message : error);
    return emptyPage(params.page);
  }
}

export async function getListings(params: {
  q?: string;
  status?: ListingStatus;
  page: number;
}): Promise<Paginated<AdminListingRow>> {
  try {
    return await listListings(params);
  } catch (error) {
    console.warn("[admin] listings unavailable.", error instanceof Error ? error.message : error);
    return emptyPage(params.page);
  }
}

export async function getReports(params: {
  status?: ReportStatus;
  page: number;
}): Promise<Paginated<AdminReportRow>> {
  try {
    return await listReports(params);
  } catch (error) {
    console.warn("[admin] reports unavailable.", error instanceof Error ? error.message : error);
    return emptyPage(params.page);
  }
}

export async function getCategories(): Promise<AdminCategoryRow[]> {
  try {
    return await listCategories();
  } catch (error) {
    console.warn("[admin] categories unavailable.", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getCategoryOptions(): Promise<Array<{ id: string; name: string }>> {
  try {
    return await listCategoryOptions();
  } catch {
    return [];
  }
}
