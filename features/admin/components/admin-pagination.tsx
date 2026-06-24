"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/** Path-agnostic pager: preserves existing query params and only swaps `page`. */
export function AdminPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  function hrefFor(target: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(target));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pagination">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        aria-label="Previous page"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page <= 1 && "pointer-events-none opacity-50",
        )}
      >
        <ChevronLeft className="size-4" />
        Prev
      </Link>
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        aria-label="Next page"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page >= totalPages && "pointer-events-none opacity-50",
        )}
      >
        Next
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
