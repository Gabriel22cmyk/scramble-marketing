"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { relativeTime } from "@/lib/utils";

interface WeeklyActivityEntry {
  id: string;
  type: string;
  content: string;
  author: "cayde" | "gabriel";
  timestamp: string;
}

interface WeeklySummaryData {
  clientId: string;
  clientName: string;
  period: { start: string; end: string; label: string };
  generatedAt: string;
  activity: {
    total: number;
    byType: Record<string, number>;
    byAuthor: Record<string, number>;
    entries: WeeklyActivityEntry[];
  };
  alerts: { total: number; critical: number; warning: number; info: number };
  setup: { progressPercent: number; briefReceived: boolean; strategyDocumented: boolean };
  campaign: { businessGoals: string; nextActions: string; seoRetainerFee: number | null; adsBudget: number | null };
  suggestedNarrative: { whatWeDid: string[]; openItems: string[]; nextWeekFocus: string };
}

interface WeeklySummaryCardProps {
  clientId: string;
}

export default function WeeklySummaryCard({ clientId }: WeeklySummaryCardProps) {
  const [data, setData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/weekly-summary`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message ?? "Failed to load weekly summary");
      }
      setData(json.data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [clientId]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <h3 className="section-title">This Week</h3>
            <p className="text-xs text-text-muted">
              {data ? data.period.label : "Last 7 days of activity"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="btn-ghost p-1.5"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading weekly summary…" />
      ) : error ? (
        <div className="text-sm text-danger p-3 rounded-lg" style={{ background: "var(--color-danger-dim)" }}>
          {error}
        </div>
      ) : !data ? null : (
        <div className="space-y-5">
          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3">
            <StatTile
              label="Actions logged"
              value={data.activity.byType?.action ?? 0}
              icon={<Activity className="w-3.5 h-3.5" />}
              color="primary"
            />
            <StatTile
              label="Open alerts"
              value={data.alerts.total}
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              color={data.alerts.critical > 0 ? "danger" : data.alerts.warning > 0 ? "warning" : "success"}
            />
            <StatTile
              label="Setup done"
              value={`${data.setup.progressPercent}%`}
              icon={<CheckCircle className="w-3.5 h-3.5" />}
              color={data.setup.progressPercent === 100 ? "success" : "accent"}
            />
          </div>

          {/* ── What we did ── */}
          {data.suggestedNarrative.whatWeDid.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                What Cayde did this week
              </p>
              <div className="space-y-1.5">
                {data.suggestedNarrative.whatWeDid.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-text leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Open items ── */}
          {data.suggestedNarrative.openItems.length > 0 &&
            data.suggestedNarrative.openItems[0] !== "No critical or warning items open." && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Still open
                </p>
                <div className="space-y-1.5">
                  {data.suggestedNarrative.openItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-text leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* ── Next week focus ── */}
          {data.suggestedNarrative.nextWeekFocus && (
            <div
              className="p-3 rounded-xl"
              style={{ background: "var(--color-primary-dim)", border: "1px solid rgba(99,102,241,0.15)" }}
            >
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" />
                Next week&apos;s focus
              </p>
              <p className="text-xs text-text leading-snug">
                {data.suggestedNarrative.nextWeekFocus}
              </p>
            </div>
          )}

          {/* ── Recent entries ── */}
          {data.activity.entries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Recent log entries
              </p>
              <div className="space-y-2">
                {data.activity.entries.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-2.5 p-2.5 rounded-lg"
                    style={{ background: "var(--color-bg-tertiary)" }}
                  >
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          entry.author === "cayde"
                            ? "var(--color-primary-dim)"
                            : "var(--color-accent-dim)",
                      }}
                    >
                      {entry.author === "cayde" ? (
                        <Bot className="w-3 h-3 text-primary" />
                      ) : (
                        <User className="w-3 h-3 text-accent" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text leading-snug line-clamp-2">
                        {entry.content}
                      </p>
                      <p className="text-[10px] text-text-dim mt-0.5">
                        {relativeTime(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Revenue context ── */}
          {(data.campaign.seoRetainerFee || data.campaign.adsBudget) && (
            <div
              className="flex items-center justify-between py-2.5 px-3 rounded-lg"
              style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-bg-border)" }}
            >
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Monthly value
              </span>
              <span className="text-sm font-bold text-success">
                £{(
                  (data.campaign.seoRetainerFee ?? 0) +
                  (data.campaign.adsBudget ?? 0)
                ).toLocaleString()}
                /mo
              </span>
            </div>
          )}

          {/* ── Agent instructions ── */}
          <div
            className="flex items-start gap-2 text-xs text-text-dim p-2.5 rounded-lg"
            style={{ background: "var(--color-bg-tertiary)" }}
          >
            <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              Agent: call{" "}
              <code className="font-mono text-primary">/api/clients/{clientId}/weekly-summary</code>{" "}
              to build the weekly report. Chain with SC and Analytics routes for metric deltas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "primary" | "accent" | "success" | "warning" | "danger";
}) {
  const colorMap = {
    primary: { bg: "var(--color-primary-dim)", text: "var(--color-primary)" },
    accent: { bg: "var(--color-accent-dim)", text: "var(--color-accent)" },
    success: { bg: "var(--color-success-dim)", text: "var(--color-success)" },
    warning: { bg: "var(--color-warning-dim)", text: "var(--color-warning)" },
    danger: { bg: "var(--color-danger-dim)", text: "var(--color-danger)" },
  };

  const { bg, text } = colorMap[color];

  return (
    <div
      className="p-3 rounded-xl text-center"
      style={{ background: bg, border: `1px solid ${text}22` }}
    >
      <div className="flex justify-center mb-1" style={{ color: text }}>{icon}</div>
      <p className="text-lg font-bold" style={{ color: text }}>{value}</p>
      <p className="text-[10px] text-text-dim mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
