"use client";

import { useState } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap,
} from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
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
  "Google Search Console": {
    icon: "🔍",
    description: "Keyword rankings, impressions & clicks",
  },
  "Google Analytics Admin": {
    icon: "📊",
    description: "Property & account management",
  },
  "Google Analytics Data": {
    icon: "📈",
    description: "Traffic, sessions & user data",
  },
  "Google Ads": {
    icon: "💰",
    description: "Campaign spend & conversions",
  },
};

const DEFAULT_SERVICES: ServiceHealth[] = [
  {
    service: "Google Search Console",
    connectionId: "e0545516-ba56-490c-a398-68f738e46987",
    status: "unknown",
  },
  {
    service: "Google Analytics Admin",
    connectionId: "410a223a-23b0-4d7e-b6f7-ccb63e53882d",
    status: "unknown",
  },
  {
    service: "Google Analytics Data",
    connectionId: "97508d12-ad42-44ec-94ff-e00e9d329ef4",
    status: "unknown",
  },
  {
    service: "Google Ads",
    connectionId: "5fc30d82-81e2-404d-87d0-603392590300",
    status: "unknown",
  },
];

function StatusIcon({ status }: { status: "ok" | "error" | "unknown" }) {
  if (status === "ok") return <CheckCircle className="w-4 h-4 text-success" />;
  if (status === "error") return <XCircle className="w-4 h-4 text-danger" />;
  return <HelpCircle className="w-4 h-4 text-text-dim" />;
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
    health?.overall === "ok"
      ? "green"
      : health?.overall === "degraded"
      ? "amber"
      : "red";

  const services = health?.services ?? DEFAULT_SERVICES;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" subtitle="Configuration & API connections" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* API Connections */}
          <div className="card">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-primary-dim)" }}
                >
                  <Zap className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <h2 className="section-title">API Connections</h2>
                  <p className="section-subtitle">
                    Connect your Google account to track client performance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {health && (
                  <Badge variant={overallBadge}>
                    {health.overall === "ok"
                      ? "All OK"
                      : health.overall === "degraded"
                      ? "Degraded"
                      : "Error"}
                  </Badge>
                )}
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  {checked ? "Re-check" : "Check Status"}
                </button>
              </div>
            </div>

            {/* Service list */}
            {loading && !health ? (
              <PageLoader text="Checking connections…" />
            ) : (
              <div className="space-y-2">
                {services.map((svc) => {
                  const info = CONNECTION_INFO[svc.service];
                  return (
                    <div
                      key={svc.connectionId}
                      className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                      style={{
                        background: "var(--color-bg-tertiary)",
                        border: "1px solid var(--color-bg-border)",
                      }}
                    >
                      <span className="text-xl flex-shrink-0">
                        {info?.icon ?? "🔗"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text">
                            {svc.service}
                          </p>
                          <StatusIcon status={svc.status} />
                          {svc.latencyMs !== undefined && (
                            <span className="text-xs text-text-dim">
                              {svc.latencyMs}ms
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">
                          {info?.description}
                        </p>
                        {svc.message && (
                          <p className="text-xs text-danger mt-1 line-clamp-1">
                            {svc.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusDot
                          status={
                            svc.status === "ok"
                              ? "active"
                              : svc.status === "error"
                              ? "error"
                              : "unknown"
                          }
                          size="md"
                          pulse={svc.status === "ok"}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {health?.checkedAt && (
              <p className="text-xs text-text-dim mt-3 text-right">
                Last checked:{" "}
                {new Date(health.checkedAt).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-text-dim py-2">
            Scramble Marketing Hub · v1.0.0 · Built with Next.js 15
          </div>
        </div>
      </main>
    </div>
  );
}
