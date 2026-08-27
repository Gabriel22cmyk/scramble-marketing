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
    health?.overall === "ok" ? "green" :
    health?.overall === "degraded" ? "amber" : "red";

  const services = health?.services ?? DEFAULT_SERVICES;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" subtitle="API connections" />

      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* API Connections */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-text mb-0.5">API Connections</h2>
                <p className="text-xs text-text-muted">
                  Connect your Google account to pull live client data.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {health && (
                  <Badge variant={overallBadge}>
                    {health.overall === "ok" ? "All OK" : health.overall === "degraded" ? "Degraded" : "Error"}
                  </Badge>
                )}
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  {checked ? "Re-check" : "Check Status"}
                </button>
              </div>
            </div>

            {loading && !health ? (
              <PageLoader text="Checking connections…" />
            ) : (
              <div className="space-y-2">
                {services.map((svc) => {
                  const info = CONNECTION_INFO[svc.service];
                  return (
                    <div
                      key={svc.connectionId}
                      className="flex items-center gap-4 p-3.5 rounded-lg border border-bg-border hover:border-text-dim transition-colors"
                    >
                      <span className="text-lg flex-shrink-0">{info?.icon ?? "🔗"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text">{svc.service}</p>
                          <StatusIcon status={svc.status} />
                          {svc.latencyMs !== undefined && (
                            <span className="text-xs text-text-dim">{svc.latencyMs}ms</span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">{info?.description}</p>
                        {svc.message && (
                          <p className="text-xs text-danger mt-1">{svc.message}</p>
                        )}
                      </div>
                      <StatusDot
                        status={svc.status === "ok" ? "active" : svc.status === "error" ? "error" : "unknown"}
                        size="md"
                        pulse={svc.status === "ok"}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {health?.checkedAt && (
              <p className="text-xs text-text-dim mt-3 text-right">
                Checked {new Date(health.checkedAt).toLocaleTimeString()}
              </p>
            )}
          </div>

          <p className="text-center text-xs text-text-dim">
            Scramble Marketing Hub · v1.0.0
          </p>
        </div>
      </main>
    </div>
  );
}
