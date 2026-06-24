import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { USER_ROLES, type UserRole } from "@/lib/constants";

/**
 * Resolves the current session on the server (RSC, Route Handlers, Server Actions).
 * Wrapped in React `cache` so multiple calls within one request hit Better Auth once.
 *
 * Returns `null` when there is no authenticated user.
 */
export const getCurrentSession = cache(async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    // Fail closed: treat an auth-backend error as "no session". Public pages stay
    // up; protected routes still redirect to sign-in.
    console.error("[session] getSession failed:", error);
    return null;
  }
});

/** Convenience: the current user, or `null`. */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/** Narrowed role of the current user, defaulting to `USER` when unknown. */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (user.role as UserRole | undefined) ?? USER_ROLES.USER;
}
