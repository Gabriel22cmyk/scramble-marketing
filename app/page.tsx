import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Globe,
  MousePointer,
  Search,
  Zap,
  BarChart3,
} from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { readClients } from "@/lib/clients-store";
import { getAllAlerts, getSetupProgress } from "@/lib/alerts";
import { DASHBOARD_DEMO_TOTALS, DEMO_SEARCH_CONSOLE } from "@/lib/demo-data";
import { getPackageLabel } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARDS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  isDemo,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  trend?: { value: number; label: string };
  isDemo?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className="stat-card relative overflow-hidden"
      style={
        highlight
          ? { border: "1px solid rgba(99,102,241,0.3)" }
          : undefined
      }
    >
      {highlight && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(99,102,241,0.05) 0%, transparent 70%)",
          }}
        />
      )}
      <div className="flex items-start justify-between relative">
        <div
          className="p-2 rounded-lg"
          style={{ background: "var(--color-bg-tertiary)" }}
        >
          {icon}
        </div>
        {isDemo && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: "var(--color-bg-border)",
              color: "var(--color-text-dim)",
            }}
          >
            SAMPLE
          </span>
        )}
      </div>
      <div className="relative">
        <p className="text-3xl font-bold text-text">{value}</p>
        {trend && (
          <span
            className="text-xs font-medium ml-2"
            style={{ color: trend.value >= 0 ? "var(--color-success)" : "var(--color-danger)" }}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-muted">{label}</p>
        <p className="text-xs text-text-dim mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER COMPONENTS (read data at request time — no client hydration)
// ─────────────────────────────────────────────────────────────────────────────

function DashboardContent() {
  const clients = readClients();
  const activeClients = clients.filter((c) => c.status === "active" || c.status === "onboarding");
  const allAlerts = getAllAlerts(clients);
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;

  // Check if any client has live data connected
  const anyLiveData = clients.some(
    (c) => c.siteUrl || c.analyticsPropertyId
  );

  // Use demo totals when no live data
  const totals = DASHBOARD_DEMO_TOTALS;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome + health bar */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Good morning, Cayde</h2>
          <p className="text-sm text-text-muted mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                background: "var(--color-danger-dim)",
                color: "var(--color-danger)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4" />
              {criticalCount} critical alert{criticalCount > 1 ? "s" : ""} need your attention
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                background: "var(--color-success-dim)",
                color: "var(--color-success)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <StatusDot status="active" size="sm" pulse />
              All systems running
            </div>
          )}
        </div>
      </div>

      {/* Demo data notice if no live connections */}
      {!anyLiveData && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl text-sm"
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-text">
              Showing sample data — connect Google APIs to see live figures
            </p>
            <p className="text-text-muted mt-0.5">
              The metrics below are representative benchmarks for clients at this stage.
              Once Search Console and Analytics are linked for each client, these update automatically.{" "}
              <Link href="/settings" className="text-primary hover:underline">
                Check connection status →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-4 h-4 text-text-muted" />}
          label="Active Clients"
          value={activeClients.length}
          sub={`${clients.length} total — ${activeClients.length} active`}
          highlight
        />
        <StatCard
          icon={<Search className="w-4 h-4 text-text-muted" />}
          label="Keywords Tracked"
          value={anyLiveData ? "—" : totals.keywordsTracked}
          sub={`${anyLiveData ? "Connect SC to track" : `${totals.keywordsTop10} in top 10 positions`}`}
          isDemo={!anyLiveData}
        />
        <StatCard
          icon={<Globe className="w-4 h-4 text-text-muted" />}
          label="Monthly Impressions"
          value={anyLiveData ? "—" : totals.totalImpressions.toLocaleString()}
          sub="How often clients appear in Google search results"
          trend={anyLiveData ? undefined : { value: 27, label: "vs prev month" }}
          isDemo={!anyLiveData}
        />
        <StatCard
          icon={<MousePointer className="w-4 h-4 text-text-muted" />}
          label="Organic Clicks"
          value={anyLiveData ? "—" : totals.totalOrganicClicks.toLocaleString()}
          sub="Visitors from Google search — not paid ads"
          trend={anyLiveData ? undefined : { value: 23, label: "vs prev month" }}
          isDemo={!anyLiveData}
        />
      </div>

      {/* Main content: Alerts + Client list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Alerts panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Needed */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <AlertCircle
                    className="w-4 h-4"
                    style={{
                      color:
                        criticalCount > 0
                          ? "var(--color-danger)"
                          : "var(--color-text-muted)",
                    }}
                  />
                  Action Needed
                </h2>
                <p className="section-subtitle mt-0.5">
                  Cayde&apos;s daily work queue — sorted by urgency
                </p>
              </div>
              {allAlerts.length > 0 && (
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    background:
                      criticalCount > 0
                        ? "var(--color-danger-dim)"
                        : "var(--color-warning-dim)",
                    color:
                      criticalCount > 0
                        ? "var(--color-danger)"
                        : "var(--color-warning)",
                  }}
                >
                  {allAlerts.length} open
                </span>
              )}
            </div>
            <AlertsPanel alerts={allAlerts} />
          </div>

          {/* Sample Search Console Preview */}
          {!anyLiveData && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="section-title">Search Performance Preview</h2>
                  <p className="section-subtitle">
                    Sample keyword data for Mitchell Plumbing
                    <span
                      className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "var(--color-bg-border)", color: "var(--color-text-dim)" }}
                    >
                      SAMPLE DATA
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-success font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +23% this month
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-bg-border)" }}>
                      <th className="text-left pb-2 pr-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Keyword</th>
                      <th className="text-right pb-2 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Clicks</th>
                      <th className="text-right pb-2 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Impressions</th>
                      <th className="text-right pb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_SEARCH_CONSOLE["client-001"].topKeywords.slice(0, 5).map((kw, i) => (
                      <tr
                        key={i}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid var(--color-bg-border)" }}
                      >
                        <td className="py-2.5 pr-4 text-text font-medium">{kw.query}</td>
                        <td className="py-2.5 px-2 text-right text-text-muted">{kw.clicks}</td>
                        <td className="py-2.5 px-2 text-right text-text-muted">{kw.impressions.toLocaleString()}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className="font-bold text-sm"
                            style={{
                              color:
                                kw.position <= 3
                                  ? "var(--color-success)"
                                  : kw.position <= 10
                                  ? "var(--color-warning)"
                                  : "var(--color-text-muted)",
                            }}
                          >
                            #{Math.round(kw.position)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-text-dim mt-3">
                Connect Search Console for live keyword data.{" "}
                <Link href="/clients/client-001" className="text-primary hover:underline">
                  Set up Mitchell Plumbing →
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Client list + connections */}
        <div className="space-y-4">
          {/* Client Roster */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">Clients</h2>
                <p className="section-subtitle">{activeClients.length} active</p>
              </div>
              <Link href="/clients" className="btn-ghost text-xs flex items-center gap-1">
                All clients
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {clients.map((client) => {
                const initials = client.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const progress = getSetupProgress(client);
                const clientAlerts = allAlerts.filter((a) => a.clientId === client.id);
                const hasCritical = clientAlerts.some((a) => a.severity === "critical");

                return (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-tertiary transition-colors group">
                      <div
                        className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative"
                      >
                        {initials}
                        {hasCritical && (
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-danger border-2"
                            style={{ borderColor: "var(--color-bg-secondary)" }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                          {client.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-dim truncate">{client.domain}</span>
                        </div>
                        {/* Setup progress */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div
                            className="flex-1 h-1 rounded-full"
                            style={{ background: "var(--color-bg-border)" }}
                          >
                            <div
                              className="h-1 rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                                background:
                                  progress === 100
                                    ? "var(--color-success)"
                                    : "var(--color-primary)",
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-text-dim flex-shrink-0">
                            {progress}% setup
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge
                          variant={
                            client.package === "seo"
                              ? "indigo"
                              : client.package === "seo-ads"
                              ? "purple"
                              : "green"
                          }
                        >
                          {getPackageLabel(client.package)}
                        </Badge>
                        {clientAlerts.length > 0 && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{
                              background: hasCritical
                                ? "var(--color-danger-dim)"
                                : "var(--color-warning-dim)",
                              color: hasCritical
                                ? "var(--color-danger)"
                                : "var(--color-warning)",
                            }}
                          >
                            {clientAlerts.length} alert{clientAlerts.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              <Link
                href="/clients"
                className="flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-medium text-text-muted hover:text-primary transition-colors hover:bg-bg-tertiary"
                style={{ border: "1px dashed var(--color-bg-border)" }}
              >
                + Add new client
              </Link>
            </div>
          </div>

          {/* API Connections quick status */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">API Connections</h2>
              <Link href="/settings" className="btn-ghost text-xs flex items-center gap-1">
                Manage
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Connected as <span className="text-text font-medium">labseme21@icloud.com</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Search Console",
                "Analytics",
                "Google Ads",
                "Sheets",
                "Drive",
                "Gmail",
                "Calendar",
                "Docs",
              ].map((svc) => (
                <div
                  key={svc}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                  style={{ background: "var(--color-bg-tertiary)" }}
                >
                  <StatusDot status="active" size="sm" pulse />
                  <span className="text-xs text-text-muted truncate">{svc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <h2 className="section-title mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { href: "/analytics", label: "View GA4 properties", icon: BarChart3 },
                { href: "/reports", label: "Generate client report", icon: Search },
                { href: "/clients", label: "Add new client", icon: Users },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg-tertiary transition-colors group"
                >
                  <Icon className="w-4 h-4 text-text-dim group-hover:text-primary transition-colors" />
                  <span className="text-sm text-text-muted group-hover:text-text transition-colors">
                    {label}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-text-dim ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Dashboard"
        subtitle="Scramble Marketing Operations Hub"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card space-y-3">
                    <SkeletonBlock className="h-4 w-8" />
                    <SkeletonBlock className="h-8 w-20" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
