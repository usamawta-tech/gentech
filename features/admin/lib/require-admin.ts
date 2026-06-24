import "server-only";

import { USER_ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";

/**
 * Returns the current user only if they are an ADMIN, else `null`.
 * The single authority for admin authorization — used by the admin layout
 * (to redirect) and every admin server action (to refuse).
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = (user.role as string | undefined) ?? USER_ROLES.USER;
  return role === USER_ROLES.ADMIN ? user : null;
}
