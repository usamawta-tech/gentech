import { NextResponse, type NextRequest } from "next/server";

import { getSearchSuggestions } from "@/features/search/services/suggestions.service";

/** Public autocomplete endpoint: GET /api/v1/search/suggest?q=... */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const suggestions = await getSearchSuggestions(q);
  return NextResponse.json(suggestions, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
