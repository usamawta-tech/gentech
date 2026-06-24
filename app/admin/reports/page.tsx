import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  ROUTES,
  type ReportStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { getReports } from "@/features/admin/services/admin.service";
import { AdminReportRow } from "@/features/admin/components/admin-report-row";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

export const metadata: Metadata = { title: "Admin — Reports" };

const FILTERS: Array<{ label: string; status?: ReportStatus }> = [
  { label: "All" },
  { label: REPORT_STATUS_LABELS.OPEN, status: REPORT_STATUSES.OPEN },
  { label: REPORT_STATUS_LABELS.REVIEWING, status: REPORT_STATUSES.REVIEWING },
  { label: REPORT_STATUS_LABELS.RESOLVED, status: REPORT_STATUSES.RESOLVED },
  { label: REPORT_STATUS_LABELS.DISMISSED, status: REPORT_STATUSES.DISMISSED },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined): number {
  const n = Number(firstParam(value));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function parseStatus(value: string | string[] | undefined): ReportStatus | undefined {
  const raw = firstParam(value);
  return raw && raw in REPORT_STATUSES ? (raw as ReportStatus) : undefined;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const page = parsePage(sp.page);
  const result = await getReports({ status, page });

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{result.total.toLocaleString()} reports</p>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href = f.status
            ? `${ROUTES.adminReports}?status=${f.status}`
            : ROUTES.adminReports;
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
          No reports here. 🎉
        </p>
      ) : (
        <div className="divide-y rounded-xl border">
          {result.items.map((report) => (
            <AdminReportRow key={report.id} report={report} />
          ))}
        </div>
      )}

      <AdminPagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
