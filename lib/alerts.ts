import { Client, ClientAlert } from "./types";

export function getClientAlerts(client: Client): ClientAlert[] {
  const alerts: ClientAlert[] = [];
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(client.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Brief not received — most critical: agent can't build strategy
  if (!client.setupChecklist.briefReceived || !client.businessBrief.description) {
    alerts.push({
      type: "no-brief",
      severity: "critical",
      title: "Business brief not filled in",
      description:
        "Cayde needs the business brief to build the campaign strategy. Gabriel needs to fill in what the client does, their goals, budget, and target audience.",
      action: "Fill in Brief",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Search Console
  if (!client.siteUrl) {
    alerts.push({
      type: "no-search-console",
      severity: daysSinceStart > 7 ? "critical" : "warning",
      title: "Search Console not connected",
      description:
        "Without Search Console, keyword rankings are invisible. We can't track whether SEO is working.",
      action: "Connect Search Console",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Analytics
  if (!client.analyticsPropertyId) {
    alerts.push({
      type: "no-analytics",
      severity: daysSinceStart > 7 ? "critical" : "warning",
      title: "Google Analytics not linked",
      description:
        "Without Analytics, website traffic is untracked. We can't measure sessions, conversions, or user behaviour.",
      action: "Link Analytics",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Ads (only for relevant packages)
  if (
    !client.adsCustomerId &&
    (client.package === "seo-ads" || client.package === "ads")
  ) {
    alerts.push({
      type: "no-ads",
      severity: "critical",
      title: "Google Ads account not linked",
      description: `${client.name} is on the ${client.package === "seo-ads" ? "SEO + Ads" : "Ads"} package but no Google Ads account is connected. Campaign spend is unmonitored.`,
      action: "Link Google Ads",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Keywords
  if (!client.setupChecklist.keywordsAdded && client.setupChecklist.briefReceived) {
    alerts.push({
      type: "no-keywords",
      severity: "warning",
      title: "Target keywords not researched yet",
      description: "Keyword research hasn't been done. SEO strategy has no direction without a target list.",
      action: "Add Keywords",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Initial audit
  if (!client.setupChecklist.initialAuditDone && daysSinceStart > 5 && client.setupChecklist.briefReceived) {
    alerts.push({
      type: "no-audit",
      severity: "warning",
      title: "Initial site audit pending",
      description: "No technical SEO audit has been run. We need this to identify issues and prioritise fixes.",
      action: "Run Audit",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Strategy not documented
  if (!client.setupChecklist.strategyDocumented && daysSinceStart > 5 && client.setupChecklist.briefReceived) {
    alerts.push({
      type: "no-keywords",
      severity: "warning",
      title: "Campaign strategy not documented",
      description: "The Campaign Strategy section is empty. Cayde needs to document the plan after reviewing the brief.",
      action: "Write Strategy",
      actionHref: `/clients/${client.id}`,
    });
  }

  // Report scheduled
  if (!client.setupChecklist.reportScheduled && daysSinceStart > 21) {
    alerts.push({
      type: "no-report-scheduled",
      severity: "info",
      title: "Monthly report not scheduled",
      description: "Monthly reports haven't been set up yet. These go to the client on the 1st of each month.",
      action: "Schedule Reports",
      actionHref: `/clients/${client.id}`,
    });
  }

  // New client
  if (daysSinceStart <= 3) {
    alerts.push({
      type: "client-new",
      severity: "info",
      title: "New client — onboarding in progress",
      description: `${client.name} joined ${daysSinceStart === 0 ? "today" : `${daysSinceStart} day${daysSinceStart > 1 ? "s" : ""} ago`}. Work through the setup checklist.`,
      action: "View Checklist",
      actionHref: `/clients/${client.id}`,
    });
  }

  return alerts;
}

export function getAllAlerts(
  clients: Client[]
): Array<ClientAlert & { clientId: string; clientName: string }> {
  return clients
    .filter((c) => c.status === "active" || c.status === "onboarding")
    .flatMap((client) =>
      getClientAlerts(client).map((alert) => ({
        ...alert,
        clientId: client.id,
        clientName: client.name,
      }))
    )
    .sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
}

export function getSetupProgress(client: Client): number {
  const cl = client.setupChecklist;
  const needsAds = client.package === "seo-ads" || client.package === "ads";
  const steps = [
    cl.clientInfoComplete,
    cl.briefReceived,
    cl.searchConsoleVerified,
    cl.analyticsLinked,
    needsAds ? cl.adsLinked : true,
    cl.keywordsAdded,
    cl.initialAuditDone,
    cl.strategyDocumented,
    cl.reportScheduled,
  ];
  const done = steps.filter(Boolean).length;
  return Math.round((done / steps.length) * 100);
}
