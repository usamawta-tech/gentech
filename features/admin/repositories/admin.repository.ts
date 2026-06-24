import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  LISTING_STATUSES,
  PAGINATION,
  REPORT_STATUSES,
  USER_ROLES,
  type ListingStatus,
  type ReportStatus,
  type UserRole,
} from "@/lib/constants";
import { slugify } from "@/utils/slug";
import type {
  AdminCategoryRow,
  AdminListingRow,
  AdminReportRow,
  AdminUserRow,
  Paginated,
  PlatformStats,
} from "@/features/admin/types";

const PAGE_SIZE = PAGINATION.defaultPageSize;

function paginate<T>(items: T[], total: number, page: number): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

// --------------------------------------------------------------------------
// Platform analytics
// --------------------------------------------------------------------------

export async function getPlatformStats(): Promise<PlatformStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsers7d, statusGroups, openReports] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    prisma.listing.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.report.count({ where: { status: REPORT_STATUSES.OPEN } }),
  ]);

  const countByStatus = new Map<ListingStatus, number>(
    statusGroups.map((g) => [g.status, g._count._all]),
  );
  const totalListings = statusGroups.reduce((sum, g) => sum + g._count._all, 0);

  return {
    totalUsers,
    newUsers7d,
    totalListings,
    activeListings: countByStatus.get(LISTING_STATUSES.ACTIVE) ?? 0,
    soldListings: countByStatus.get(LISTING_STATUSES.SOLD) ?? 0,
    openReports,
  };
}

// --------------------------------------------------------------------------
// Users
// --------------------------------------------------------------------------

export async function listUsers(params: { q?: string; page: number }): Promise<
  Paginated<AdminUserRow>
> {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { email: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const skip = (params.page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items: AdminUserRow[] = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    banned: u.banned,
    emailVerified: u.emailVerified,
    listingCount: u._count.listings,
    createdAt: u.createdAt.toISOString(),
  }));
  return paginate(items, total, params.page);
}

export async function setUserBanned(
  userId: string,
  banned: boolean,
  reason?: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { banned, banReason: banned ? (reason ?? "Violation of marketplace policy") : null },
  });
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { role } });
}

/** Whether `userId` is the only remaining admin (guards against self-demotion lockout). */
export async function isLastAdmin(userId: string): Promise<boolean> {
  const admins = await prisma.user.findMany({
    where: { role: USER_ROLES.ADMIN, deletedAt: null },
    select: { id: true },
    take: 2,
  });
  return admins.length === 1 && admins[0]?.id === userId;
}

// --------------------------------------------------------------------------
// Listings (admin override — not seller-scoped)
// --------------------------------------------------------------------------

export async function listListings(params: {
  q?: string;
  status?: ListingStatus;
  page: number;
}): Promise<Paginated<AdminListingRow>> {
  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.q ? { title: { contains: params.q, mode: "insensitive" } } : {}),
  };
  const skip = (params.page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        status: true,
        city: true,
        views: true,
        createdAt: true,
        seller: { select: { name: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  const items: AdminListingRow[] = rows.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    price: Number(l.price),
    currency: l.currency,
    status: l.status,
    city: l.city ?? "—",
    views: l.views,
    sellerName: l.seller.name,
    createdAt: l.createdAt.toISOString(),
  }));
  return paginate(items, total, params.page);
}

export async function adminSetListingStatus(
  listingId: string,
  status: ListingStatus,
): Promise<void> {
  await prisma.listing.update({ where: { id: listingId }, data: { status } });
}

export async function adminRemoveListing(listingId: string): Promise<void> {
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: LISTING_STATUSES.REMOVED, deletedAt: new Date() },
  });
}

// --------------------------------------------------------------------------
// Reports
// --------------------------------------------------------------------------

export async function listReports(params: {
  status?: ReportStatus;
  page: number;
}): Promise<Paginated<AdminReportRow>> {
  const where: Prisma.ReportWhereInput = params.status ? { status: params.status } : {};
  const skip = (params.page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        reporter: { select: { name: true } },
        listing: { select: { title: true, slug: true } },
        reportedUser: { select: { name: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  const items: AdminReportRow[] = rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    status: r.status,
    reporterName: r.reporter.name,
    listing: r.listing ? { title: r.listing.title, slug: r.listing.slug } : null,
    reportedUserName: r.reportedUser?.name ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
  return paginate(items, total, params.page);
}

export async function setReportStatus(reportId: string, status: ReportStatus): Promise<void> {
  await prisma.report.update({ where: { id: reportId }, data: { status } });
}

// --------------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------------

export async function listCategories(): Promise<AdminCategoryRow[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      position: true,
      parent: { select: { name: true } },
      _count: { select: { listings: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentName: c.parent?.name ?? null,
    isActive: c.isActive,
    listingCount: c._count.listings,
    position: c.position,
  }));
}

/** Creates a category with a unique slug derived from its name. */
export async function createCategory(input: {
  name: string;
  parentId?: string;
}): Promise<void> {
  const base = slugify(input.name) || "category";
  // Ensure slug uniqueness without a random suffix (categories want clean URLs).
  let slug = base;
  for (let i = 2; await prisma.category.findUnique({ where: { slug }, select: { id: true } }); i++) {
    slug = `${base}-${i}`;
  }
  await prisma.category.create({
    data: { name: input.name, slug, parentId: input.parentId },
  });
}

export async function renameCategory(categoryId: string, name: string): Promise<void> {
  await prisma.category.update({ where: { id: categoryId }, data: { name } });
}

export async function setCategoryActive(categoryId: string, isActive: boolean): Promise<void> {
  await prisma.category.update({ where: { id: categoryId }, data: { isActive } });
}

/** Deletes a category only if it has no listings; returns false otherwise. */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  const count = await prisma.listing.count({ where: { categoryId } });
  if (count > 0) return false;
  await prisma.category.delete({ where: { id: categoryId } });
  return true;
}

/** Flat list of categories for the "parent" selector when creating. */
export async function listCategoryOptions(): Promise<Array<{ id: string; name: string }>> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
