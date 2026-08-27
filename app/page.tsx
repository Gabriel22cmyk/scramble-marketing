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
    <div className="max-w-3xl mx-auto py-20 px-6">
      {/* Hero */}
      <div className="text-center mb-14">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            color: "var(--color-primary)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          System online
        </div>
        <h1 className="text-4xl font-extrabold text-text tracking-tight mb-4" style={{ letterSpacing: "-0.5px", lineHeight: 1.1 }}>
          Welcome to <span className="gradient-text">Scramble</span>
        </h1>
        <p className="text-lg text-text-muted max-w-md mx-auto leading-relaxed">
          Your marketing operations hub. Get started by adding your first client.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link
          href="/clients"
          className="group card hover:shadow-glow"
          style={{ padding: "1.75rem" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center"
              style={{ boxShadow: "0 2px 8px rgba(8, 145, 178, 0.2)" }}
            >
              <Plus className="w-5 h-5 text-white" />
            </div>
            <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm font-bold text-text mb-1.5">Add a client</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Business details, goals, and budget — everything needed to start tracking SEO.
          </p>
        </Link>

        <Link
          href="/settings"
          className="group card hover:shadow-glow"
          style={{ padding: "1.75rem" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-accent-dim)" }}
            >
              <Settings className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
            </div>
            <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm font-bold text-text mb-1.5">Connect APIs</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Link Google Search Console, Analytics, and Ads to pull live performance data.
          </p>
        </Link>

        <div
          className="card"
          style={{ padding: "1.75rem", border: "1px dashed rgba(0, 0, 0, 0.08)" }}
        >
          <div className="mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0, 0, 0, 0.03)" }}
            >
              <BarChart3 className="w-5 h-5 text-text-dim" />
            </div>
          </div>
          <p className="text-sm font-bold text-text-muted mb-1.5">Reports</p>
          <p className="text-sm text-text-dim leading-relaxed">
            Auto-generated weekly and monthly reports. Available once clients are added.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: "1.75rem", border: "1px dashed rgba(0, 0, 0, 0.08)" }}
        >
          <div className="mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0, 0, 0, 0.03)" }}
            >
              <Zap className="w-5 h-5 text-text-dim" />
            </div>
          </div>
          <p className="text-sm font-bold text-text-muted mb-1.5">Automations</p>
          <p className="text-sm text-text-dim leading-relaxed">
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
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Clients</p>
          </div>
          <p className="text-3xl font-extrabold text-text">{activeClients.length}</p>
          <p className="text-xs text-text-muted">{clients.length} total · {activeClients.length} active</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" style={{ color: criticalCount > 0 ? "var(--color-danger)" : "var(--color-text-muted)" }} />
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Alerts</p>
          </div>
          <p className="text-3xl font-extrabold text-text">{allAlerts.length}</p>
          <p className="text-xs text-text-muted">{criticalCount} critical</p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2">
          {allAlerts.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className="w-4 h-4"
                    style={{ color: criticalCount > 0 ? "var(--color-danger)" : "var(--color-text-muted)" }}
                  />
                  <h2 className="section-title">Action Needed</h2>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: criticalCount > 0 ? "var(--color-danger-dim)" : "var(--color-warning-dim)",
                    color: criticalCount > 0 ? "var(--color-danger)" : "var(--color-warning)",
                  }}
                >
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
              <Link href="/clients" className="btn-ghost text-xs flex items-center gap-1">
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

                return (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-dim transition-colors group">
                      <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
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
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold text-text-muted hover:text-primary hover:bg-primary-dim transition-colors mt-2"
                style={{ border: "1px dashed rgba(0, 0, 0, 0.08)" }}
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
      <main className="flex-1 overflow-y-auto p-8">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="card space-y-3">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="h-8 w-12" />
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
