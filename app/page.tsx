import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Settings,
  BarChart3,
  Zap,
} from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { readClients } from "@/lib/clients-store";
import { getAllAlerts, getSetupProgress } from "@/lib/alerts";
import { getPackageLabel } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyDashboard() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-bg-border text-xs font-medium text-text-muted mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          System online
        </div>
        <h1 className="text-3xl font-bold text-text tracking-tight mb-3">
          Welcome to Scramble
        </h1>
        <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed">
          Your marketing operations hub. Get started by adding your first client.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        <Link
          href="/clients"
          className="group p-5 rounded-xl border border-bg-border bg-bg-card hover:border-text-dim transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center">
              <Plus className="w-4 h-4 text-text" />
            </div>
            <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-text transition-colors" />
          </div>
          <p className="text-sm font-semibold text-text mb-1">Add a client</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Add business details, goals, and budget to start tracking SEO performance.
          </p>
        </Link>

        <Link
          href="/settings"
          className="group p-5 rounded-xl border border-bg-border bg-bg-card hover:border-text-dim transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center">
              <Settings className="w-4 h-4 text-text" />
            </div>
            <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-text transition-colors" />
          </div>
          <p className="text-sm font-semibold text-text mb-1">Connect APIs</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Link Google Search Console, Analytics, and Ads to pull live data.
          </p>
        </Link>

        <div className="group p-5 rounded-xl border border-dashed border-bg-border bg-bg-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-text-dim" />
            </div>
          </div>
          <p className="text-sm font-semibold text-text-muted mb-1">Reports</p>
          <p className="text-xs text-text-dim leading-relaxed">
            Auto-generated weekly and monthly reports. Available once clients are added.
          </p>
        </div>

        <div className="group p-5 rounded-xl border border-dashed border-bg-border bg-bg-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center">
              <Zap className="w-4 h-4 text-text-dim" />
            </div>
          </div>
          <p className="text-sm font-semibold text-text-muted mb-1">Automations</p>
          <p className="text-xs text-text-dim leading-relaxed">
            Rank monitoring, alerts, and scheduled tasks. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard with clients ──────────────────────────────────────────────────

function DashboardContent() {
  const clients = readClients();
  const activeClients = clients.filter((c) => c.status === "active" || c.status === "onboarding");
  const allAlerts = getAllAlerts(clients);
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;

  if (clients.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Clients</p>
          <p className="text-2xl font-bold text-text">{activeClients.length}</p>
          <p className="text-xs text-text-dim">{clients.length} total · {activeClients.length} active</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Alerts</p>
          <p className="text-2xl font-bold text-text">{allAlerts.length}</p>
          <p className="text-xs text-text-dim">{criticalCount} critical</p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2">
          {allAlerts.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className="w-4 h-4"
                    style={{
                      color: criticalCount > 0 ? "var(--color-danger)" : "var(--color-text-muted)",
                    }}
                  />
                  <h2 className="section-title">Action Needed</h2>
                </div>
                <span className="text-xs font-medium text-text-muted">
                  {allAlerts.length} open
                </span>
              </div>
              <AlertsPanel alerts={allAlerts} />
            </div>
          )}
        </div>

        {/* Client list */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Clients</h2>
              <Link href="/clients" className="text-xs font-medium text-text-muted hover:text-text transition-colors flex items-center gap-1">
                View all
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1">
              {clients.map((client) => {
                const initials = client.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const progress = getSetupProgress(client);

                return (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="flex items-center gap-3 p-2.5 -mx-1 rounded-lg hover:bg-bg-tertiary transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-bg-tertiary flex items-center justify-center text-xs font-semibold text-text-muted flex-shrink-0 border border-bg-border">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text group-hover:text-text truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-text-dim truncate">{client.domain}</p>
                      </div>
                      <Badge
                        variant={
                          client.package === "seo" ? "indigo"
                          : client.package === "seo-ads" ? "purple"
                          : "green"
                        }
                      >
                        {getPackageLabel(client.package)}
                      </Badge>
                    </div>
                  </Link>
                );
              })}

              <Link
                href="/clients"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors border border-dashed border-bg-border mt-2"
              >
                <Plus className="w-3 h-3" />
                Add client
              </Link>
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
      <Topbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="card space-y-3">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="h-7 w-12" />
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
