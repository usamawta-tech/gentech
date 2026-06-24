import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { getUsers } from "@/features/admin/services/admin.service";
import { AdminSearch } from "@/features/admin/components/admin-search";
import { AdminUserRow } from "@/features/admin/components/admin-user-row";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

export const metadata: Metadata = { title: "Admin — Users" };

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  const sp = await searchParams;
  const q = firstParam(sp.q);
  const page = parsePage(sp.page);
  const result = await getUsers({ q, page });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{result.total.toLocaleString()} users</p>
        <AdminSearch placeholder="Search name or email…" />
      </div>

      {result.items.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          No users found.
        </p>
      ) : (
        <div className="divide-y rounded-xl border">
          {result.items.map((user) => (
            <AdminUserRow key={user.id} user={user} selfId={admin.id} />
          ))}
        </div>
      )}

      <AdminPagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
