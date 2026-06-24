import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Authoritative authorization boundary for all `/admin` routes. The edge proxy does
 * an optimistic auth-cookie check; this layout enforces the ADMIN role before render.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-6 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <AdminNav />
        </div>
        {children}
      </main>
    </div>
  );
}
