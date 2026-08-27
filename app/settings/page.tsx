"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Bell,
  Shield,
  Database,
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
  "Google Sheets": { icon: "📋", description: "Client data & reporting spreadsheets" },
  "Google Drive": { icon: "📁", description: "Reports, assets & documents" },
  "Google Docs": { icon: "📄", description: "Reports & content documents" },
  "Google Mail": { icon: "✉️", description: "Client communication & alerts" },
  "Google Calendar": { icon: "📅", description: "Campaign scheduling & reminders" },
};

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" subtitle="Configuration & connection management" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* API Connections */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="section-title">Maton API Connections</h2>
                  <p className="section-subtitle">labseme21@icloud.com · All Google services</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {health && (
                  <Badge variant={overallBadge}>
                    {health.overall === "ok" ? "All OK" : health.overall === "degraded" ? "Degraded" : "Error"}
                  </Badge>
                )}
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  {checked ? "Re-check" : "Check Health"}
                </button>
              </div>
            </div>

            {loading && !health ? (
              <PageLoader text="Checking connections…" />
            ) : (
              <div className="space-y-2">
                {(health?.services ?? [
                  { service: "Google Search Console", connectionId: "e0545516-ba56-490c-a398-68f738e46987", status: "unknown" as const },
                  { service: "Google Analytics Admin", connectionId: "410a223a-23b0-4d7e-b6f7-ccb63e53882d", status: "unknown" as const },
                  { service: "Google Analytics Data", connectionId: "97508d12-ad42-44ec-94ff-e00e9d329ef4", status: "unknown" as const },
                  { service: "Google Ads", connectionId: "5fc30d82-81e2-404d-87d0-603392590300", status: "unknown" as const },
                  { service: "Google Sheets", connectionId: "f0113f6d-da60-40ab-9cc5-1be352e77ae6", status: "unknown" as const },
                  { service: "Google Drive", connectionId: "0248269d-78bd-4909-93ed-2f37efb11e86", status: "unknown" as const },
                  { service: "Google Docs", connectionId: "ec784bc5-7362-45f5-9666-31638a0ae087", status: "unknown" as const },
                  { service: "Google Mail", connectionId: "c680583d-f679-4a7d-8a90-64a70c615061", status: "unknown" as const },
                  { service: "Google Calendar", connectionId: "0c3188c3-95c9-4113-919c-dc382fde3f00", status: "unknown" as const },
                ]).map((svc) => {
                  const info = CONNECTION_INFO[svc.service];
                  return (
                    <div
                      key={svc.connectionId}
                      className="flex items-center gap-4 p-4 rounded-xl border border-bg-border bg-bg-tertiary hover:border-primary/20 transition-colors"
                    >
                      <span className="text-2xl flex-shrink-0">{info?.icon ?? "🔗"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text">{svc.service}</p>
                          <StatusIcon status={svc.status} />
                          {svc.latencyMs !== undefined && (
                            <span className="text-xs text-text-dim">{svc.latencyMs}ms</span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">{info?.description}</p>
                        <p className="text-xs text-text-dim font-mono mt-0.5">{svc.connectionId}</p>
                        {svc.message && (
                          <p className="text-xs text-danger mt-1 line-clamp-1">{svc.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusDot
                          status={svc.status === "ok" ? "active" : svc.status === "error" ? "error" : "unknown"}
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
                Last checked: {new Date(health.checkedAt).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-accent" />
              <h2 className="section-title">Notifications</h2>
            </div>

            <div className="space-y-3">
              {[
                { label: "Weekly digest", description: "Summary of all client activity every Monday", enabled: true },
                { label: "Ranking alerts", description: "Notify when a keyword drops more than 5 positions", enabled: true },
                { label: "Traffic drops", description: "Alert when organic traffic drops >20% week-on-week", enabled: false },
                { label: "Report ready", description: "Notify when a monthly report is generated", enabled: true },
              ].map((notif) => (
                <div key={notif.label} className="flex items-start justify-between p-3 rounded-lg bg-bg-tertiary">
                  <div>
                    <p className="text-sm font-medium text-text">{notif.label}</p>
                    <p className="text-xs text-text-muted">{notif.description}</p>
                  </div>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                      notif.enabled ? "bg-primary" : "bg-bg-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        notif.enabled ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-success" />
              <h2 className="section-title">Data Management</h2>
            </div>

            <div className="space-y-2">
              <SettingsRow
                label="Client data location"
                description="data/clients.json (local file store)"
                action="Edit"
              />
              <SettingsRow
                label="Export all client data"
                description="Download a JSON backup of all client records"
                action="Export"
              />
              <SettingsRow
                label="Migrate to Supabase"
                description="Move client data to a hosted database"
                action="Configure"
                badge="Coming Soon"
              />
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-warning" />
              <h2 className="section-title">Security</h2>
            </div>

            <div className="p-4 rounded-xl bg-bg-tertiary border border-bg-border">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-text-dim mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">Credential Management</p>
                  <p className="text-xs text-text-muted mt-1">
                    All API credentials are managed through the Maton CLI gateway. No credentials are stored in this application.
                    Connection IDs reference your Maton account at <span className="text-primary font-mono text-[11px]">labseme21@icloud.com</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="text-center text-xs text-text-dim py-2">
            Scramble Marketing Hub · v1.0.0 · Built with Next.js 15
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  action,
  badge,
}: {
  label: string;
  description: string;
  action: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary hover:bg-bg-secondary transition-colors">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge ? (
          <Badge variant="gray">{badge}</Badge>
        ) : (
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            {action}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
