import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Settings,
  ArrowRight,
  Activity,
  Plus,
} from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { readClients } from "@/lib/clients-store";
import { getAllAlerts, getSetupProgress } from "@/lib/alerts";
import { getPackageLabel } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

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
// QUICK START CARD
// ─────────────────────────────────────────────────────────────────────────────

function QuickStartCard({
  href,
  icon: Icon,
  label,
  description,
  iconColor,
  iconBg,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Link href={href} className="card-interactive group flex flex-col gap-4 p-5 rounded-xl">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-text leading-tight">{label}</p>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium" style={{ color: iconColor }}>
        Get started
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE — modern hero + quick start cards
// ─────────────────────────────────────────────────────────────────────────────

function EmptyStateHero() {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-10 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(20,184,166,0.06) 40%, rgba(245,158,11,0.08) 100%)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        {/* Decorative glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-90px",
            right: "-90px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">
            Welcome to{" "}
            <span className="gradient-text">Scramble</span>
          </h1>
          <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed">
            Your marketing operations hub. Track SEO, ads, and client
            performance — all in one place.
          </p>
        </div>
      </div>

      {/* Quick Start grid */}
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-text-dim)" }}
        >
          Get started
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStartCard
            href="/clients"
            icon={Plus}
            label="Add First Client"
            description="Start tracking SEO rankings and ad spend for a new client."
            iconColor="var(--color-primary)"
            iconBg="var(--color-primary-dim)"
          />
          <QuickStartCard
            href="/settings"
            icon={Settings}
            label="Connect APIs"
            description="Link Google Search Console, Analytics, and Ads accounts."
            iconColor="var(--color-accent)"
            iconBg="var(--color-accent-dim)"
          />
          <QuickStartCard
            href="/clients"
            icon={Users}
            label="View Clients"
            description="Browse and manage your full client portfolio."
            iconColor="#818cf8"
            iconBg="rgba(129,140,248,0.12)"
          />
          <QuickStartCard
            href="/settings"
            icon={Activity}
            label="Check Status"
            description="Verify all API connections are healthy and ready."
            iconColor="var(--color-success)"
            iconBg="var(--color-success-dim)"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER COMPONENTS (read data at request time — no client hydration)
// ─────────────────────────────────────────────────────────────────────────────

function DashboardContent() {
  const clients = readClients();
  const activeClients = clients.filter(
    (c) => c.status === "active" || c.status === "onboarding"
  );
  const allAlerts = getAllAlerts(clients);
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;

  // If no clients, show empty state
  if (clients.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <EmptyStateHero />
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
                  <p className="section-subtitle mt-0.5">Sorted by urgency</p>
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
              <Link
                href="/clients"
                className="btn-ghost text-xs flex items-center gap-1"
              >
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
                const clientAlerts = allAlerts.filter(
                  (a) => a.clientId === client.id
                );
                const hasCritical = clientAlerts.some(
                  (a) => a.severity === "critical"
                );

                return (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-tertiary transition-colors group">
                      <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative">
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
                          <span className="text-xs text-text-dim truncate">
                            {client.domain}
                          </span>
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
                            {clientAlerts.length} alert
                            {clientAlerts.length > 1 ? "s" : ""}
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
