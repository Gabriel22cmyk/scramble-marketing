/**
 * GET /api/agent/dashboard
 *
 * The agent's primary autonomous check-in endpoint.
 *
 * Returns everything the agent needs in ONE call to determine:
 *   1. Which clients need immediate attention (critical alerts)
 *   2. Which clients have pending setup tasks
 *   3. Overall portfolio health
 *   4. What to work on today
 *
 * This is the first call a cron process should make. From the response,
 * the agent can decide which client-specific routes to call next
 * (e.g. /api/clients/[id]/weekly-summary, /api/search-console/analytics).
 *
 * Agent polling: once per day (recommended 08:00 UTC)
 * Cache: 5 minutes
 */

import { NextResponse } from "next/server";
import { readClients } from "@/lib/clients-store";
import { getClientAlerts, getSetupProgress } from "@/lib/alerts";
import { ClientAlert } from "@/lib/types";
import { withCache, CACHE_TTL } from "@/lib/api-response";

interface ClientWorkItem {
  clientId: string;
  clientName: string;
  clientDomain: string;
  package: string;
  status: string;
  setupProgress: number;
  alerts: {
    total: number;
    critical: number;
    warning: number;
    list: ClientAlert[];
  };
  integrations: {
    searchConsole: boolean;
    analytics: boolean;
    ads: boolean;
    adsRequired: boolean;
  };
  briefReceived: boolean;
  strategyDocumented: boolean;
  lastActivityAt: string | null;
  /** Direct link to the weekly summary for this client */
  weeklySummaryUrl: string;
  /** Priority score — higher = needs more urgent attention */
  urgencyScore: number;
}

interface AgentDashboard {
  generatedAt: string;
  portfolio: {
    total: number;
    active: number;
    onboarding: number;
    paused: number;
  };
  health: {
    allGreen: boolean;
    criticalAlerts: number;
    warningAlerts: number;
    clientsWithIssues: number;
  };
  /**
   * Clients sorted by urgency — work through this list top to bottom.
   * Critical alerts → missing setup → paused clients
   */
  workQueue: ClientWorkItem[];
  /**
   * Aggregated list of all open alerts across all clients,
   * sorted: critical first, then by client.
   */
  allAlerts: Array<ClientAlert & { clientId: string; clientName: string }>;
  /**
   * Guidance for the agent — plain English summary of what to focus on today.
   * Generated from the alert state, not hardcoded.
   */
  agentBriefing: string;
}

function urgencyScore(item: Pick<ClientWorkItem, "alerts" | "setupProgress" | "briefReceived">): number {
  let score = 0;
  score += item.alerts.critical * 10;
  score += item.alerts.warning * 3;
  if (!item.briefReceived) score += 8;
  if (item.setupProgress < 30) score += 5;
  else if (item.setupProgress < 60) score += 2;
  return score;
}

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const now = new Date();
  const clients = readClients();
  const activeClients = clients.filter(
    (c) => c.status === "active" || c.status === "onboarding"
  );

  const workQueue: ClientWorkItem[] = activeClients.map((client) => {
    const alerts = getClientAlerts(client);
    const progress = getSetupProgress(client);
    const needsAds = client.package === "seo-ads" || client.package === "ads";
    const lastNote = client.notes?.[0]?.timestamp ?? null;

    const item: ClientWorkItem = {
      clientId: client.id,
      clientName: client.name,
      clientDomain: client.domain,
      package: client.package,
      status: client.status,
      setupProgress: progress,
      alerts: {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === "critical").length,
        warning: alerts.filter((a) => a.severity === "warning").length,
        list: alerts,
      },
      integrations: {
        searchConsole: !!client.siteUrl,
        analytics: !!client.analyticsPropertyId,
        ads: !!client.adsCustomerId,
        adsRequired: needsAds,
      },
      briefReceived: client.setupChecklist.briefReceived,
      strategyDocumented: client.setupChecklist.strategyDocumented,
      lastActivityAt: lastNote,
      weeklySummaryUrl: `${baseUrl}/api/clients/${client.id}/weekly-summary`,
      urgencyScore: 0, // filled below
    };

    item.urgencyScore = urgencyScore(item);
    return item;
  });

  // Sort by urgency descending
  workQueue.sort((a, b) => b.urgencyScore - a.urgencyScore);

  // Aggregate all alerts
  const allAlerts = activeClients
    .flatMap((client) =>
      getClientAlerts(client).map((a) => ({
        ...a,
        clientId: client.id,
        clientName: client.name,
      }))
    )
    .sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

  const totalCritical = allAlerts.filter((a) => a.severity === "critical").length;
  const totalWarning = allAlerts.filter((a) => a.severity === "warning").length;
  const clientsWithIssues = workQueue.filter((c) => c.alerts.critical > 0 || c.alerts.warning > 0).length;

  // Portfolio counts
  const portfolio = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    onboarding: clients.filter((c) => c.status === "onboarding").length,
    paused: clients.filter((c) => c.status === "paused").length,
  };

  // Generate agent briefing
  const agentBriefing = buildAgentBriefing(workQueue, totalCritical, totalWarning);

  const dashboard: AgentDashboard = {
    generatedAt: now.toISOString(),
    portfolio,
    health: {
      allGreen: totalCritical === 0 && totalWarning === 0,
      criticalAlerts: totalCritical,
      warningAlerts: totalWarning,
      clientsWithIssues,
    },
    workQueue,
    allAlerts,
    agentBriefing,
  };

  const response = NextResponse.json({ ok: true, data: dashboard });
  return withCache(response, CACHE_TTL.CLIENTS);
}

function buildAgentBriefing(
  workQueue: ClientWorkItem[],
  criticalCount: number,
  warningCount: number
): string {
  const lines: string[] = [];
  const now = new Date();
  lines.push(`Daily briefing generated at ${now.toUTCString()}.`);

  if (criticalCount === 0 && warningCount === 0) {
    lines.push("All clients are in good standing — no critical or warning alerts.");
  } else {
    if (criticalCount > 0) {
      lines.push(
        `${criticalCount} critical alert${criticalCount > 1 ? "s" : ""} require immediate attention.`
      );
    }
    if (warningCount > 0) {
      lines.push(
        `${warningCount} warning${warningCount > 1 ? "s" : ""} need to be addressed this week.`
      );
    }
  }

  const noBrief = workQueue.filter((c) => !c.briefReceived);
  if (noBrief.length > 0) {
    lines.push(
      `${noBrief.length} client${noBrief.length > 1 ? "s" : ""} (${noBrief.map((c) => c.clientName).join(", ")}) ` +
        `${noBrief.length > 1 ? "have" : "has"} no business brief — Gabriel needs to fill this in before campaigns can be built.`
    );
  }

  const noSC = workQueue.filter((c) => !c.integrations.searchConsole);
  if (noSC.length > 0) {
    lines.push(
      `Search Console not connected for: ${noSC.map((c) => c.clientName).join(", ")}. ` +
        `Follow up on verification status.`
    );
  }

  const highPriority = workQueue.filter((c) => c.urgencyScore >= 10);
  if (highPriority.length > 0) {
    lines.push(
      `Highest priority today: ${highPriority.map((c) => c.clientName).join(", ")}.`
    );
  }

  return lines.join(" ");
}
