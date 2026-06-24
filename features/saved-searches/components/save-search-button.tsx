"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { trackSaveSearch } from "@/features/analytics/lib/events";
import { saveSearchAction } from "@/features/saved-searches/actions/saved-search.actions";

export function SaveSearchButton({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function save() {
    if (!isAuthenticated) {
      router.push(ROUTES.signIn);
      return;
    }
    setPending(true);
    const query = window.location.search.replace(/^\?/, "");
    const result = await saveSearchAction({ query });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not save this search.");
      return;
    }
    trackSaveSearch(query);
    toast.success("Search saved", { description: "Find it under Saved Searches." });
  }

  return (
    <Button variant="outline" size="sm" onClick={save} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Bookmark className="size-4" />}
      <span className="hidden sm:inline">Save search</span>
    </Button>
  );
}
