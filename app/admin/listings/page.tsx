import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  ROUTES,
  type ListingStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { getListings } from "@/features/admin/services/admin.service";
import { AdminSearch } from "@/features/admin/components/admin-search";
import { AdminListingRow } from "@/features/admin/components/admin-listing-row";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

export const metadata: Metadata = { title: "Admin — Listings" };

const FILTERS: Array<{ label: string; status?: ListingStatus }> = [
  { label: "All" },
  { label: LISTING_STATUS_LABELS.ACTIVE, status: LISTING_STATUSES.ACTIVE },
  { label: LISTING_STATUS_LABELS.SOLD, status: LISTING_STATUSES.SOLD },
  { label: LISTING_STATUS_LABELS.DRAFT, status: LISTING_STATUSES.DRAFT },
  { label: LISTING_STATUS_LABELS.EXPIRED, status: LISTING_STATUSES.EXPIRED },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined): number {
  const n = Number(firstParam(value));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function parseStatus(value: string | string[] | undefined): ListingStatus | undefined {
  const raw = firstParam(value);
  return raw && raw in LISTING_STATUSES ? (raw as ListingStatus) : undefined;
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  const sp = await searchParams;
  const q = firstParam(sp.q);
  const status = parseStatus(sp.status);
  const page = parsePage(sp.page);
  const result = await getListings({ q, status, page });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{result.total.toLocaleString()} listings</p>
        <AdminSearch placeholder="Search by title…" />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href = f.status
            ? `${ROUTES.adminListings}?status=${f.status}`
            : ROUTES.adminListings;
          const active = f.status === status || (!f.status && !status);
          return (
            <Link
              key={f.label}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "hover:bg-accent text-muted-foreground",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {result.items.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          No listings found.
        </p>
      ) : (
        <div className="divide-y rounded-xl border">
          {result.items.map((listing) => (
            <AdminListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <AdminPagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
