"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import type { auth } from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * Browser-side auth client. `inferAdditionalFields<typeof auth>()` makes custom
 * fields (e.g. `role`) type-safe on the client without importing server code —
 * the `auth` import is type-only and is erased at build time.
 */
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
} = authClient;
