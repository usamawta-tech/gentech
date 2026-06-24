"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { LISTING_STATUSES, ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import {
  changeListingStatus,
  removeListing,
} from "@/features/seller/services/seller.service";

const listingIdSchema = z.object({ listingId: z.string().min(1) });

type ActionResult = { ok: boolean; error?: string };

const SIGN_IN_REQUIRED = "Sign in to manage your listings.";
const NOT_FOUND = "Listing not found.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

function revalidateSellerSurfaces() {
  revalidatePath(ROUTES.myListings);
  revalidatePath(ROUTES.dashboard);
}

/** Marks one of the current seller's listings as SOLD. */
export async function markListingSoldAction(input: {
  listingId: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = listingIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: NOT_FOUND };

  try {
    const ok = await changeListingStatus(user.id, parsed.data.listingId, LISTING_STATUSES.SOLD);
    if (!ok) return { ok: false, error: NOT_FOUND };
    revalidateSellerSurfaces();
    return { ok: true };
  } catch (error) {
    console.error("[seller] markSold failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Re-activates one of the current seller's listings (e.g. relist after sold). */
export async function markListingActiveAction(input: {
  listingId: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = listingIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: NOT_FOUND };

  try {
    const ok = await changeListingStatus(user.id, parsed.data.listingId, LISTING_STATUSES.ACTIVE);
    if (!ok) return { ok: false, error: NOT_FOUND };
    revalidateSellerSurfaces();
    return { ok: true };
  } catch (error) {
    console.error("[seller] markActive failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Soft-deletes one of the current seller's listings. */
export async function deleteListingAction(input: {
  listingId: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = listingIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: NOT_FOUND };

  try {
    const ok = await removeListing(user.id, parsed.data.listingId);
    if (!ok) return { ok: false, error: NOT_FOUND };
    revalidateSellerSurfaces();
    return { ok: true };
  } catch (error) {
    console.error("[seller] deleteListing failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
