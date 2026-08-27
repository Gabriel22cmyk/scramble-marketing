/**
 * GET /api/analytics/properties
 * Lists all GA4 accounts and properties accessible via the connected Google account.
 * Agent polling: max once per day.
 */
import { NextResponse } from "next/server";
import { analytics, MatonError } from "@/lib/maton";
import { apiError, classifyMatonError, withCache, CACHE_TTL } from "@/lib/api-response";

export async function GET() {
  try {
    const data = analytics.listProperties();
    const res = NextResponse.json({ ok: true, data });
    return withCache(res, CACHE_TTL.ANALYTICS);
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
