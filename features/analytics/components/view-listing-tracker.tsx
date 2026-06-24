"use client";

import * as React from "react";

import { trackViewListing } from "@/features/analytics/lib/events";

/**
 * Fires a `view_listing` event once when a listing detail page mounts. Rendered by the
 * (server) detail page so the event carries real listing context to every provider.
 */
export function ViewListingTracker(props: {
  id: string;
  title: string;
  price: number;
  category?: string;
}) {
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackViewListing(props);
  }, [props]);

  return null;
}
