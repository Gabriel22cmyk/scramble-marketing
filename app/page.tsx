import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { readClients } from "@/lib/clients-store";
import { getAllAlerts, getSetupProgress } from "@/lib/alerts";
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="stat-card relative overflow-hidden">
      <div className="flex items-start justify-between relative">
        <div
          className="p-2 rounded-lg"
          style={{ background: "var(--color-bg-tertiary)" }}
        >
          {icon}
        </div>
      </div>
      <div className="relative">
        <p className="text-3xl font-bold text-text">{value}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-muted">{label}</p>
        <p className="text-xs text-text-dim mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyStateCard() {
  return (
    <div className="card">
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--color-primary-dim)" }}
        >
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-text mb-2">No clients yet</h3>
        <p className="text-sm text-text-muted mb-6 max-w-xs">
          Add your first client to start tracking their SEO and ad performance
        </p>
        <Link href="/clients" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
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

  // If no clients, show empty state
  if (clients.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text">Welcome to Scramble</h1>
          <p className="text-base text-text-muted">
            Your marketing operations hub. Add your first client to get started.
          </p>
        </div>

        {/* Empty State */}
        <EmptyStateCard />
      </div>
    );
  }

  // Clients exist — show dashboard
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard
          icon={<Users className="w-4 h-4 text-text-muted" />}
          label="Active Clients"
          value={activeClients.length}
          sub={`${clients.length} total — ${activeClients.length} active`}
        />
        <StatCard
          icon={<AlertCircle className="w-4 h-4 text-text-muted" />}
          label="Alerts"
          value={allAlerts.length}
          sub={`${criticalCount} critical`}
        />
      </div>

      {/* Main content: Alerts + Client list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Alerts panel */}
        <div className="lg:col-span-2 space-y-6">
          {allAlerts.length > 0 && (
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
                    Sorted by urgency
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
          )}
        </div>

        {/* RIGHT: Client list */}
        <div className="space-y-4">
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
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
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
