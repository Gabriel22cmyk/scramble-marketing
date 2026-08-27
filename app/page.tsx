import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  Plus,
  ArrowRight,
  Settings,
  BarChart3,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { readClients } from "@/lib/clients-store";
import { getAllAlerts, getSetupProgress } from "@/lib/alerts";
import { getPackageLabel } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

/* ═══════════════════════════════════════════════════════
   EMPTY STATE — Hero + onboarding cards
   ═══════════════════════════════════════════════════════ */

function EmptyDashboard() {
  return (
    <>
      {/* Hero */}
      <section
        className="text-center relative"
        style={{
          background: "linear-gradient(135deg, #e8f4f8 0%, #f0f9fc 25%, #e0f2fe 50%, #ede9fe 75%, #e8f4f8 100%)",
          backgroundSize: "200% 200%",
          animation: "pearlShift 12s ease-in-out infinite",
          paddingTop: "180px",
          paddingBottom: "96px",
          overflow: "hidden",
        }}
      >
        {/* Radial overlays — decorative only, isolated so it never clips text */}
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 25% 50%, rgba(8, 145, 178, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 75% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              color: "#0891b2",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            System Online
          </div>

          <h1
            className="text-5xl font-extrabold mb-5"
            style={{ color: "#1e293b", letterSpacing: "-1px", lineHeight: 1.1 }}
          >
            Your Marketing{" "}
            <span style={{ color: "#0891b2" }}>Operations Hub</span>
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: "#64748b", lineHeight: 1.7 }}>
            Add clients, connect APIs, and let Scramble handle SEO tracking, reporting, and campaign management.
          </p>

          {/* Hero buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                boxShadow: "0 4px 14px rgba(8, 145, 178, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <Plus className="w-5 h-5" />
              Add First Client
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                color: "#0891b2",
                border: "1px solid rgba(8, 145, 178, 0.2)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              Connect APIs
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section
        className="py-20"
        style={{ background: "linear-gradient(180deg, #f8fdfe 0%, #f0f9fc 50%, #f8fdfe 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#1e293b" }}>
              Everything You Need
            </h2>
            <p className="text-lg" style={{ color: "#64748b", maxWidth: 550, margin: "0 auto" }}>
              Track SEO, manage clients, and generate reports — all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: "Client Management",
                desc: "Add clients with goals, budgets, and business briefs. Track onboarding progress.",
                active: true,
              },
              {
                icon: <Settings className="w-6 h-6" />,
                title: "API Integrations",
                desc: "Google Search Console, Analytics, and Ads — pull live performance data.",
                active: true,
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Automated Reports",
                desc: "Weekly and monthly reports generated automatically for every client.",
                active: false,
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Rank Monitoring",
                desc: "Keyword position tracking with alerts when rankings drop or climb.",
                active: false,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-8 rounded-2xl transition-all hover:-translate-y-1.5"
                style={{
                  background: "white",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  borderRadius: "20px",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center"
                  style={{
                    background: item.active ? "rgba(8, 145, 178, 0.08)" : "rgba(0,0,0,0.03)",
                    color: item.active ? "#0891b2" : "#94a3b8",
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#1e293b" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {item.desc}
                </p>
                {!item.active && (
                  <span
                    className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.04)", color: "#94a3b8" }}
                  >
                    Coming Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD WITH CLIENTS
   ═══════════════════════════════════════════════════════ */

function DashboardContent() {
  const clients = readClients();
  const activeClients = clients.filter((c) => c.status === "active" || c.status === "onboarding");
  const allAlerts = getAllAlerts(clients);
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;

  if (clients.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <>
      {/* Header section — centered hero */}
      <section
        className="text-center"
        style={{
          background: "linear-gradient(135deg, #e8f4f8 0%, #f0f9fc 50%, #e0f2fe 100%)",
          paddingTop: "180px",
          paddingBottom: "64px",
        }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: "#1e293b", letterSpacing: "-0.5px" }}>
            Dashboard
          </h1>
          <p className="text-lg" style={{ color: "#64748b" }}>
            {activeClients.length} active client{activeClients.length !== 1 ? "s" : ""} · {allAlerts.length} alert{allAlerts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6" style={{ background: "#f8fdfe" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Clients", value: clients.length, color: "#0891b2" },
              { label: "Active", value: activeClients.length, color: "#16a34a" },
              { label: "Alerts", value: allAlerts.length, color: criticalCount > 0 ? "#ef4444" : "#f59e0b" },
              { label: "Critical", value: criticalCount, color: "#ef4444" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl text-center"
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#64748b" }}>{stat.label}</p>
                <p className="text-3xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients + Alerts */}
      <section className="py-12 px-6" style={{ background: "linear-gradient(180deg, #f8fdfe 0%, #ffffff 100%)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts */}
          {allAlerts.length > 0 && (
            <div className="lg:col-span-2">
              <div
                className="p-7 rounded-2xl"
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: criticalCount > 0 ? "#ef4444" : "#f59e0b" }} />
                    <h2 className="text-lg font-bold" style={{ color: "#1e293b" }}>Action Needed</h2>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: criticalCount > 0 ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                      color: criticalCount > 0 ? "#ef4444" : "#f59e0b",
                    }}
                  >
                    {allAlerts.length} open
                  </span>
                </div>
                <AlertsPanel alerts={allAlerts} />
              </div>
            </div>
          )}

          {/* Client list */}
          <div>
            <div
              className="p-7 rounded-2xl"
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: "#1e293b" }}>Clients</h2>
                <Link href="/clients" className="text-sm font-medium flex items-center gap-1 transition-colors" style={{ color: "#0891b2" }}>
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {clients.map((client) => {
                  const initials = client.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <Link key={client.id} href={`/clients/${client.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)" }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold group-hover:text-cyan-600 transition-colors truncate" style={{ color: "#1e293b" }}>
                            {client.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: "#94a3b8" }}>{client.domain}</p>
                        </div>
                        <Badge
                          variant={client.package === "seo" ? "indigo" : client.package === "seo-ads" ? "purple" : "green"}
                        >
                          {getPackageLabel(client.package)}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <SkeletonBlock className="h-12 w-64 mx-auto" />
            <SkeletonBlock className="h-6 w-96 mx-auto" />
          </div>
        </section>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
