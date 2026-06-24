import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth mounts all of its endpoints (sign-in, sign-up, OAuth callbacks,
// verification, password reset, ...) under /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth.handler);
