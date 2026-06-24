"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { createListingSchema, type CreateListingInput } from "../schemas/create-listing";
import { createListing } from "../services/listing.service";

export interface CreateListingResult {
  ok: boolean;
  slug?: string;
  error?: string;
}

/** Server action: validate input, enforce auth + verified email, persist the listing. */
export async function createListingAction(input: CreateListingInput): Promise<CreateListingResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to post a listing." };
  }
  if (!user.emailVerified) {
    return { ok: false, error: "Please verify your email before posting a listing." };
  }

  const parsed = createListingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields and try again." };
  }

  try {
    const { slug } = await createListing(parsed.data, user.id);
    revalidatePath(ROUTES.marketplace);
    revalidatePath(ROUTES.dashboard);
    return { ok: true, slug };
  } catch (error) {
    console.error("[create-listing] failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create the listing.",
    };
  }
}
