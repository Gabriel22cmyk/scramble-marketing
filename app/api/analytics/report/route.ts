/**
 * GET /api/analytics/report
 * Runs a standard 30-day GA4 report for a given property.
 *
 * Query params:
 *   propertyId - required; format: properties/123456789 or just 123456789
 *
 * Agent polling: max once per hour per property.
 */
import { NextRequest, NextResponse } from "next/server";
import { analytics, MatonError } from "@/lib/maton";
import { apiError, classifyMatonError, withCache, CACHE_TTL } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return apiError("BAD_REQUEST", "propertyId query parameter is required", 400, {
      retryable: false,
    });
  }

  try {
    const data = analytics.runReport(propertyId);
    const res = NextResponse.json({ ok: true, data });
    return withCache(res, CACHE_TTL.ANALYTICS);
  } catch (err: unknown) {
    if (err instanceof MatonError) {
      const { code } = classifyMatonError(err.message);
      return apiError(code, err.message, err.retryable ? 503 : 500, {
        retryable: err.retryable,
        details: { propertyId },
      });
    }
    return apiError("INTERNAL_ERROR", (err as Error).message ?? "Unknown error", 500);
  }
}
