"use client";

import { useSearchParams } from "next/navigation";

import { ROUTES } from "@/lib/constants";

type Patch = Record<string, string | null | undefined>;

/**
 * Returns a builder that produces a `/marketplace` URL from the current params plus
 * a patch. Empty/null values remove the key. Changing any filter resets pagination
 * to page 1 unless `resetPage: false` is passed (used by the pager itself).
 */
export function useListingHref() {
  const searchParams = useSearchParams();

  return (patch: Patch, opts?: { resetPage?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    }

    if (opts?.resetPage !== false) params.delete("page");

    const qs = params.toString();
    return `${ROUTES.marketplace}${qs ? `?${qs}` : ""}`;
  };
}
