/**
 * GET /api/search-console/sites
 * Lists all verified sites in Google Search Console.
 * Agent polling: max once per hour (see Cache-Control header).
 */
import { NextResponse } from "next/server";
import { searchConsole } from "@/lib/maton";
import { MatonError } from "@/lib/maton";
import { apiError, classifyMatonError, withCache, CACHE_TTL } from "@/lib/api-response";

export async function GET() {
  try {
    const data = searchConsole.listSites();
    const res = NextResponse.json({ ok: true, data });
    return withCache(res, CACHE_TTL.SEARCH_CONSOLE);
  } catch (err: unknown) {
    if (err instanceof MatonError) {
      const { code } = classifyMatonError(err.message);
      return apiError(code, err.message, err.retryable ? 503 : 500, {
        retryable: err.retryable,
      });
    }
    return apiError("INTERNAL_ERROR", (err as Error).message ?? "Unknown error", 500);
  }
}
