import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { PROTECTED_ROUTE_PREFIXES, ROUTES } from "@/lib/constants";

/**
 * Optimistic auth gate (Next.js 16 "proxy" convention — the successor to middleware).
 *
 * Runs on the edge, so it only checks for the *presence* of the session cookie — it
 * never hits the database. Authoritative session + role checks happen in the protected
 * route's server layout (see `app/(dashboard)/layout.tsx`).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL(ROUTES.signIn, request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/admin/:path*", "/sell/:path*"],
};
