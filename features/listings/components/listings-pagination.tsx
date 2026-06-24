"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useListingHref } from "@/features/listings/hooks/use-listing-href";

/** Builds a compact page-number window around the current page. */
function pageWindow(current: number, total: number): number[] {
  const span = 1;
  const pages = new Set<number>([1, total, current]);
  for (let i = current - span; i <= current + span; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  return [...pages].sort((a, b) => a - b);
}

export function ListingsPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const buildHref = useListingHref();
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);
  const linkCls = (active = false) =>
    cn(
      buttonVariants({ variant: active ? "default" : "outline", size: "icon-sm" }),
      "min-w-9",
      active && "pointer-events-none",
    );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={buildHref({ page: String(page - 1) }, { resetPage: false })}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          page <= 1 && "pointer-events-none opacity-50",
        )}
        aria-disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap ? <span className="text-muted-foreground px-1">…</span> : null}
            <Link
              href={buildHref({ page: String(p) }, { resetPage: false })}
              className={linkCls(p === page)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={buildHref({ page: String(page + 1) }, { resetPage: false })}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          page >= totalPages && "pointer-events-none opacity-50",
        )}
        aria-disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
