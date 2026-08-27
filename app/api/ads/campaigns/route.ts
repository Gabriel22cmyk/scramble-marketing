/**
 * GET /api/ads/campaigns
 * Returns campaign list and performance for a Google Ads customer.
 *
 * Query params:
 *   customerId  - required; format: 123-456-7890 or 1234567890
 *   dateRange   - optional; LAST_7_DAYS | LAST_30_DAYS | THIS_MONTH (default: LAST_30_DAYS)
 *
 * Agent polling: max once per 30 minutes (ad data is volatile).
 */
import { NextRequest, NextResponse } from "next/server";
import { googleAds, MatonError } from "@/lib/maton";
import { apiError, classifyMatonError, withCache, CACHE_TTL } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const dateRange = searchParams.get("dateRange") ?? "LAST_30_DAYS";

  if (!customerId) {
    return apiError("BAD_REQUEST", "customerId query parameter is required", 400, {
      retryable: false,
    });
  }

  // Fetch campaigns and performance in parallel; surface partial results on failure
  const [campaignsResult, performanceResult] = await Promise.allSettled([
    Promise.resolve(googleAds.listCampaigns(customerId)),
    Promise.resolve(googleAds.campaignPerformance(customerId, dateRange)),
  ]);

  const campaigns =
    campaignsResult.status === "fulfilled" ? campaignsResult.value : null;
  const performance =
    performanceResult.status === "fulfilled" ? performanceResult.value : null;

  // If both failed, return error
  if (!campaigns && !performance) {
    const firstErr =
      campaignsResult.status === "rejected"
        ? campaignsResult.reason as Error
        : (performanceResult as PromiseRejectedResult).reason as Error;
    const raw = firstErr?.message ?? "Failed to fetch campaign data";

    if (firstErr instanceof MatonError) {
      const { code } = classifyMatonError(firstErr.message);
      return apiError(code, firstErr.message, firstErr.retryable ? 503 : 500, {
        retryable: firstErr.retryable,
        details: { customerId, dateRange },
      });
    }
    return apiError("GOOGLE_API_ERROR", raw, 502, { retryable: true });
  }

  const res = NextResponse.json({
    ok: true,
    data: {
      customerId,
      dateRange,
      campaigns,
      performance,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      partial: !campaigns || !performance,
      errors: {
        campaigns:
          campaignsResult.status === "rejected"
            ? (campaignsResult.reason as Error)?.message
            : null,
        performance:
          performanceResult.status === "rejected"
            ? (performanceResult.reason as Error)?.message
            : null,
      },
    },
  });

  return withCache(res, CACHE_TTL.ADS);
}
