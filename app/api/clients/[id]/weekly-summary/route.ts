/**
 * GET /api/clients/[id]/weekly-summary
 *
 * Returns a structured weekly summary for a client — designed to be called
 * by autonomous agent cron processes (typically every Sunday or Monday morning)
 * to generate the weekly report Gabriel receives.
 *
 * Does NOT call live Google APIs directly (those have their own routes with
 * appropriate rate limiting). Instead aggregates from:
 *   - Activity log entries from the past 7 days
 *   - Client setup state and open alerts
 *   - Campaign strategy (next actions, goals)
 *   - Metric connection status (live data fetched separately)
 *
 * The agent process should:
 *   1. Call this route to get the weekly summary structure
 *   2. Optionally call /api/search-console/analytics and /api/analytics/report
 *      for the metric deltas (if accounts are connected)
 *   3. Compose the weekly report for Gabriel using both
 *
 * Agent polling: once per week (Sunday 23:00 UTC recommended)
 * Cache: 1 hour (see Cache-Control header)
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientById } from "@/lib/clients-store";
import { getClientAlerts, getSetupProgress } from "@/lib/alerts";
import { ClientNote, ClientAlert } from "@/lib/types";
import { withCache, CACHE_TTL } from "@/lib/api-response";

interface WeeklySummary {
  clientId: string;
  clientName: string;
  clientDomain: string;
  package: string;

  period: {
    start: string;   // ISO — 7 days ago at 00:00 UTC
    end: string;     // ISO — now
    label: string;   // "21–27 Aug 2026"
  };

  generatedAt: string;

  /**
   * Activity log entries from the past 7 days.
   * These form the raw material for "what we did this week".
   */
  activity: {
    total: number;
    byType: Record<string, number>;
    byAuthor: Record<string, number>;
    entries: ClientNote[];
  };

  /**
   * Open alerts — what still needs to be fixed.
   */
  alerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    list: ClientAlert[];
  };

  /**
   * Setup progress summary.
   */
  setup: {
    progressPercent: number;
    briefReceived: boolean;
    searchConsoleConnected: boolean;
    analyticsConnected: boolean;
    adsConnected: boolean;
    strategyDocumented: boolean;
  };

  /**
   * Campaign context — pulled from the working strategy doc.
   * Agent uses this to contextualise what it did this week against the plan.
   */
  campaign: {
    businessGoals: string;
    nextActions: string;
    seoRetainerFee: number | null;
    adsBudget: number | null;
    strategyUpdatedAt?: string;
  };

  /**
   * Metric connection status — tells the agent whether to call
   * the live metric routes to get performance data.
   */
  metrics: {
    searchConsole: {
      connected: boolean;
      siteUrl: string | null;
      /** Agent should call /api/search-console/analytics?siteUrl=... to get data */
      fetchUrl: string | null;
    };
    analytics: {
      connected: boolean;
      propertyId: string | null;
      /** Agent should call /api/analytics/report?propertyId=... to get data */
      fetchUrl: string | null;
    };
    ads: {
      connected: boolean;
      customerId: string | null;
      required: boolean;
      /** Agent should call /api/ads/campaigns?customerId=... to get data */
      fetchUrl: string | null;
    };
  };

  /**
   * Suggested weekly report narrative for the agent to build on.
   * Plain English — ready to expand into the client-facing report.
   */
  suggestedNarrative: {
    whatWeDid: string[];
    openItems: string[];
    nextWeekFocus: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = getClientById(id);
  if (!client) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: `Client '${id}' not found`,
          retryable: false,
        },
      },
      { status: 404 }
    );
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // ── Activity from past 7 days ──────────────────────────────────────────────
  const weekNotes = (client.notes ?? []).filter(
    (n) => new Date(n.timestamp) >= weekStart
  );

  const byType: Record<string, number> = {};
  const byAuthor: Record<string, number> = {};
  for (const note of weekNotes) {
    byType[note.type] = (byType[note.type] ?? 0) + 1;
    byAuthor[note.author] = (byAuthor[note.author] ?? 0) + 1;
  }

  // ── Alerts ─────────────────────────────────────────────────────────────────
  const alertList = getClientAlerts(client);
  const alertSummary = {
    total: alertList.length,
    critical: alertList.filter((a) => a.severity === "critical").length,
    warning: alertList.filter((a) => a.severity === "warning").length,
    info: alertList.filter((a) => a.severity === "info").length,
    list: alertList,
  };

  // ── Metrics fetch URLs ─────────────────────────────────────────────────────
  const baseUrl = request.nextUrl.origin;
  const needsAds = client.package === "seo-ads" || client.package === "ads";
  const today = now.toISOString().slice(0, 10);
  const sevenDaysAgo = weekStart.toISOString().slice(0, 10);

  const metrics: WeeklySummary["metrics"] = {
    searchConsole: {
      connected: !!client.siteUrl,
      siteUrl: client.siteUrl,
      fetchUrl: client.siteUrl
        ? `${baseUrl}/api/search-console/analytics?siteUrl=${encodeURIComponent(client.siteUrl)}&startDate=${sevenDaysAgo}&endDate=${today}&dimensions=query&rowLimit=25`
        : null,
    },
    analytics: {
      connected: !!client.analyticsPropertyId,
      propertyId: client.analyticsPropertyId,
      fetchUrl: client.analyticsPropertyId
        ? `${baseUrl}/api/analytics/report?propertyId=${encodeURIComponent(client.analyticsPropertyId)}`
        : null,
    },
    ads: {
      connected: !!client.adsCustomerId,
      customerId: client.adsCustomerId,
      required: needsAds,
      fetchUrl: client.adsCustomerId
        ? `${baseUrl}/api/ads/campaigns?customerId=${encodeURIComponent(client.adsCustomerId)}`
        : null,
    },
  };

  // ── Suggested narrative ────────────────────────────────────────────────────
  const whatWeDid = weekNotes
    .filter((n) => n.type === "action")
    .map((n) => {
      // Truncate long entries to first sentence for the narrative
      const firstSentence = n.content.split("\n")[0].slice(0, 200);
      return firstSentence;
    });

  const openItems = alertList
    .filter((a) => a.severity === "critical" || a.severity === "warning")
    .map((a) => a.title);

  const nextWeekFocus = client.campaignStrategy.nextActions
    ? client.campaignStrategy.nextActions.split("\n").find((l) => l.trim().startsWith("1."))?.slice(3) ?? client.campaignStrategy.nextActions.slice(0, 150)
    : "No planned actions documented yet — update the Campaign Strategy section.";

  // ── Period label ───────────────────────────────────────────────────────────
  const formatShort = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const periodLabel = `${formatShort(weekStart)} – ${formatShort(now)}`;

  const summary: WeeklySummary = {
    clientId: client.id,
    clientName: client.name,
    clientDomain: client.domain,
    package: client.package,

    period: {
      start: weekStart.toISOString(),
      end: now.toISOString(),
      label: periodLabel,
    },

    generatedAt: now.toISOString(),

    activity: {
      total: weekNotes.length,
      byType,
      byAuthor,
      entries: weekNotes,
    },

    alerts: alertSummary,

    setup: {
      progressPercent: getSetupProgress(client),
      briefReceived: client.setupChecklist.briefReceived,
      searchConsoleConnected: client.setupChecklist.searchConsoleVerified,
      analyticsConnected: client.setupChecklist.analyticsLinked,
      adsConnected: client.setupChecklist.adsLinked,
      strategyDocumented: client.setupChecklist.strategyDocumented,
    },

    campaign: {
      businessGoals: client.businessBrief.businessGoals,
      nextActions: client.campaignStrategy.nextActions,
      seoRetainerFee: client.businessBrief.seoRetainerFee,
      adsBudget: client.businessBrief.adsBudget,
      strategyUpdatedAt: client.campaignStrategy.updatedAt,
    },

    metrics,

    suggestedNarrative: {
      whatWeDid: whatWeDid.length > 0
        ? whatWeDid
        : ["No actions logged this week. Log activity in the client Activity Log."],
      openItems: openItems.length > 0
        ? openItems
        : ["No critical or warning items open."],
      nextWeekFocus,
    },
  };

  const response = NextResponse.json({ ok: true, data: summary });
  return withCache(response, CACHE_TTL.WEEKLY_SUMMARY);
}
