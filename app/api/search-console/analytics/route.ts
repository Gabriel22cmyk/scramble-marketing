/**
 * GET /api/search-console/analytics
 * Runs a Search Console analytics query for a given site.
 *
 * Query params:
 *   siteUrl     - required; sc-domain:example.co.uk or https://example.co.uk
 *   startDate   - YYYY-MM-DD (default: 30 days ago)
 *   endDate     - YYYY-MM-DD (default: today)
 *   dimensions  - comma-separated: query,page,country,device (default: query)
 *   rowLimit    - integer 1–25000 (default: 25)
 *
 * Agent polling: max once per 4 hours per site (SC data updates ~daily).
 */
import { NextRequest, NextResponse } from "next/server";
import { searchConsole, MatonError } from "@/lib/maton";
import { apiError, classifyMatonError, withCache, CACHE_TTL } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get("siteUrl");

  if (!siteUrl) {
    return apiError("BAD_REQUEST", "siteUrl query parameter is required", 400, {
      retryable: false,
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const startDate = searchParams.get("startDate") ?? thirtyDaysAgo;
  const endDate = searchParams.get("endDate") ?? today;
  const dimensions = (searchParams.get("dimensions") ?? "query").split(",").filter(Boolean);
  const rowLimit = Math.min(Math.max(parseInt(searchParams.get("rowLimit") ?? "25"), 1), 25000);

  try {
    const data = searchConsole.queryAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions,
      rowLimit,
    });
    const res = NextResponse.json({ ok: true, data });
    return withCache(res, CACHE_TTL.SEARCH_CONSOLE);
  } catch (err: unknown) {
    if (err instanceof MatonError) {
      const { code } = classifyMatonError(err.message);
      return apiError(code, err.message, err.retryable ? 503 : 500, {
        retryable: err.retryable,
        details: { siteUrl, startDate, endDate },
      });
    }
    return apiError("INTERNAL_ERROR", (err as Error).message ?? "Unknown error", 500);
  }
}
