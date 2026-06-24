"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { pageview } from "@/features/analytics/lib/client";

/**
 * Emits a page view on every client-side navigation. Lives inside a Suspense boundary
 * (in the root layout) because `useSearchParams` opts the subtree into dynamic rendering.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const qs = searchParams?.toString();
    pageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
