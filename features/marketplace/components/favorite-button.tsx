"use client";

import * as React from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Heart toggle overlaid on a listing card. In Phase 2 this is an optimistic visual
 * toggle; Phase 3 wires it to the favorites mutation + auth gate.
 */
export function FavoriteButton({ className }: { className?: string }) {
  const [active, setActive] = React.useState(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive((v) => !v);
      }}
      className={cn(
        "bg-background/80 hover:bg-background grid size-9 place-items-center rounded-full backdrop-blur transition-colors",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4.5 transition-colors",
          active ? "fill-red-500 text-red-500" : "text-foreground",
        )}
      />
    </button>
  );
}
