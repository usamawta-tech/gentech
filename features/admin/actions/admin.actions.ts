"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  LISTING_STATUSES,
  REPORT_STATUSES,
  ROUTES,
  USER_ROLES,
} from "@/lib/constants";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import {
  adminRemoveListing,
  adminSetListingStatus,
  createCategory,
  deleteCategory,
  isLastAdmin,
  renameCategory,
  setCategoryActive,
  setReportStatus,
  setUserBanned,
  setUserRole,
} from "@/features/admin/repositories/admin.repository";

type ActionResult = { ok: boolean; error?: string };

const FORBIDDEN = "Admin access required.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Wraps an admin mutation with an authorization check + uniform error handling. */
async function adminAction(
  run: (adminId: string) => Promise<ActionResult | void>,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: FORBIDDEN };
  try {
    const result = await run(admin.id);
    return result ?? { ok: true };
  } catch (error) {
    console.error("[admin] action failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

// --------------------------------------------------------------------------
// Users
// --------------------------------------------------------------------------

const banSchema = z.object({
  userId: z.string().min(1),
  banned: z.boolean(),
  reason: z.string().trim().max(300).optional(),
});

export async function setUserBannedAction(input: {
  userId: string;
  banned: boolean;
  reason?: string;
}): Promise<ActionResult> {
  return adminAction(async (adminId) => {
    const parsed = banSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request." };
    if (parsed.data.userId === adminId) return { ok: false, error: "You can't ban yourself." };

    await setUserBanned(parsed.data.userId, parsed.data.banned, parsed.data.reason);
    revalidatePath(ROUTES.adminUsers);
  });
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum([USER_ROLES.USER, USER_ROLES.ADMIN]),
});

export async function setUserRoleAction(input: {
  userId: string;
  role: typeof USER_ROLES.USER | typeof USER_ROLES.ADMIN;
}): Promise<ActionResult> {
  return adminAction(async (adminId) => {
    const parsed = roleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request." };

    // Prevent the last admin from demoting themselves into a lockout.
    if (
      parsed.data.userId === adminId &&
      parsed.data.role === USER_ROLES.USER &&
      (await isLastAdmin(adminId))
    ) {
      return { ok: false, error: "You're the only admin — promote someone else first." };
    }

    await setUserRole(parsed.data.userId, parsed.data.role);
    revalidatePath(ROUTES.adminUsers);
  });
}

// --------------------------------------------------------------------------
// Listings
// --------------------------------------------------------------------------

const listingStatusSchema = z.object({
  listingId: z.string().min(1),
  status: z.enum([
    LISTING_STATUSES.DRAFT,
    LISTING_STATUSES.ACTIVE,
    LISTING_STATUSES.SOLD,
    LISTING_STATUSES.EXPIRED,
    LISTING_STATUSES.REMOVED,
  ]),
});

export async function adminSetListingStatusAction(input: {
  listingId: string;
  status: (typeof LISTING_STATUSES)[keyof typeof LISTING_STATUSES];
}): Promise<ActionResult> {
  return adminAction(async () => {
    const parsed = listingStatusSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request." };
    await adminSetListingStatus(parsed.data.listingId, parsed.data.status);
    revalidatePath(ROUTES.adminListings);
  });
}

export async function adminDeleteListingAction(input: {
  listingId: string;
}): Promise<ActionResult> {
  return adminAction(async () => {
    if (!input.listingId) return { ok: false, error: "Invalid request." };
    await adminRemoveListing(input.listingId);
    revalidatePath(ROUTES.adminListings);
  });
}

// --------------------------------------------------------------------------
// Reports
// --------------------------------------------------------------------------

const reportStatusSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum([
    REPORT_STATUSES.OPEN,
    REPORT_STATUSES.REVIEWING,
    REPORT_STATUSES.RESOLVED,
    REPORT_STATUSES.DISMISSED,
  ]),
});

export async function setReportStatusAction(input: {
  reportId: string;
  status: (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];
}): Promise<ActionResult> {
  return adminAction(async () => {
    const parsed = reportStatusSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request." };
    await setReportStatus(parsed.data.reportId, parsed.data.status);
    revalidatePath(ROUTES.adminReports);
  });
}

// --------------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------------

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  parentId: z.string().trim().optional(),
});

export async function createCategoryAction(input: {
  name: string;
  parentId?: string;
}): Promise<ActionResult> {
  return adminAction(async () => {
    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Enter a category name (2–60 chars)." };
    await createCategory({
      name: parsed.data.name,
      parentId: parsed.data.parentId || undefined,
    });
    revalidatePath(ROUTES.adminCategories);
  });
}

const renameSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(60),
});

export async function renameCategoryAction(input: {
  categoryId: string;
  name: string;
}): Promise<ActionResult> {
  return adminAction(async () => {
    const parsed = renameSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Enter a valid name (2–60 chars)." };
    await renameCategory(parsed.data.categoryId, parsed.data.name);
    revalidatePath(ROUTES.adminCategories);
  });
}

export async function setCategoryActiveAction(input: {
  categoryId: string;
  isActive: boolean;
}): Promise<ActionResult> {
  return adminAction(async () => {
    if (!input.categoryId) return { ok: false, error: "Invalid request." };
    await setCategoryActive(input.categoryId, input.isActive);
    revalidatePath(ROUTES.adminCategories);
  });
}

export async function deleteCategoryAction(input: {
  categoryId: string;
}): Promise<ActionResult> {
  return adminAction(async () => {
    if (!input.categoryId) return { ok: false, error: "Invalid request." };
    const deleted = await deleteCategory(input.categoryId);
    if (!deleted) return { ok: false, error: "Category has listings and can't be deleted." };
    revalidatePath(ROUTES.adminCategories);
  });
}
