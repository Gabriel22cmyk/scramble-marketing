"use client";

import { useState } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap,
} from "lucide-react";
import StatusDot from "@/components/ui/StatusDot";
import Badge from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";

interface ServiceHealth {
  service: string;
  connectionId: string;
  status: "ok" | "error" | "unknown";
  message?: string;
  latencyMs?: number;
}

interface HealthResponse {
  overall: "ok" | "degraded" | "error";
  checkedAt: string;
  services: ServiceHealth[];
}

const CONNECTION_INFO: Record<string, { icon: string; description: string }> = {
  "Google Search Console": { icon: "🔍", description: "Keyword rankings, impressions & clicks" },
  "Google Analytics Admin": { icon: "📊", description: "Property & account management" },
  "Google Analytics Data": { icon: "📈", description: "Traffic, sessions & user data" },
  "Google Ads": { icon: "💰", description: "Campaign spend & conversions" },
};

const DEFAULT_SERVICES: ServiceHealth[] = [
  { service: "Google Search Console", connectionId: "gsc", status: "unknown" },
  { service: "Google Analytics Admin", connectionId: "ga-admin", status: "unknown" },
  { service: "Google Analytics Data", connectionId: "ga-data", status: "unknown" },
  { service: "Google Ads", connectionId: "gads", status: "unknown" },
];

function StatusIcon({ status }: { status: "ok" | "error" | "unknown" }) {
  if (status === "ok") return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (status === "error") return <XCircle className="w-5 h-5 text-red-500" />;
  return <HelpCircle className="w-5 h-5" style={{ color: "#94a3b8" }} />;
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
      setChecked(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const overallBadge =
    health?.overall === "ok" ? "green" :
    health?.overall === "degraded" ? "amber" : "red";

  const services = health?.services ?? DEFAULT_SERVICES;

  return (
    <>
      {/* Header — centered hero */}
      <section
        className="text-center"
        style={{
          background: "linear-gradient(135deg, #e8f4f8 0%, #f0f9fc 50%, #e0f2fe 100%)",
          paddingTop: "180px",
          paddingBottom: "64px",
        }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <h1
            className="text-4xl font-extrabold mb-3"
            style={{ color: "#1e293b", letterSpacing: "-0.5px" }}
          >
            Settings
          </h1>
          <p className="text-lg" style={{ color: "#64748b" }}>
            Manage API connections and integrations
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6" style={{ background: "#f8fdfe" }}>
        <div className="max-w-4xl mx-auto">
          <div
            className="p-8 rounded-2xl"
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                    boxShadow: "0 2px 10px rgba(8, 145, 178, 0.25)",
                  }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#1e293b" }}>API Connections</h2>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Connect your Google account to pull live client data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {health && (
                  <Badge variant={overallBadge}>
                    {health.overall === "ok" ? "All OK" : health.overall === "degraded" ? "Degraded" : "Error"}
                  </Badge>
                )}
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(10px)",
                    color: "#0891b2",
                    border: "1px solid rgba(8,145,178,0.2)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  {checked ? "Re-check" : "Check Status"}
                </button>
              </div>
            </div>

            {/* Services */}
            {loading && !health ? (
              <PageLoader text="Checking connections…" />
            ) : (
              <div className="space-y-3">
                {services.map((svc) => {
                  const info = CONNECTION_INFO[svc.service];
                  return (
                    <div
                      key={svc.connectionId}
                      className="flex items-center gap-5 p-5 rounded-xl transition-all"
                      style={{
                        background: "#f8fdfe",
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <span className="text-2xl flex-shrink-0">{info?.icon ?? "🔗"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold" style={{ color: "#1e293b" }}>{svc.service}</p>
                          <StatusIcon status={svc.status} />
                          {svc.latencyMs !== undefined && (
                            <span className="text-xs" style={{ color: "#94a3b8" }}>{svc.latencyMs}ms</span>
                          )}
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{info?.description}</p>
                        {svc.message && (
                          <p className="text-sm text-red-500 mt-1">{svc.message}</p>
                        )}
                      </div>
                      <StatusDot
                        status={svc.status === "ok" ? "active" : svc.status === "error" ? "error" : "unknown"}
                        size="lg"
                        pulse={svc.status === "ok"}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {health?.checkedAt && (
              <p className="text-sm mt-5 text-right" style={{ color: "#94a3b8" }}>
                Last checked {new Date(health.checkedAt).toLocaleTimeString()}
              </p>
            )}
          </div>

          <p className="text-center text-sm font-medium mt-8" style={{ color: "#94a3b8" }}>
            Scramble Marketing Hub · v1.0.0
          </p>
        </div>
      </section>
    </>
  );
}
