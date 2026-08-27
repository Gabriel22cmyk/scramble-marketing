"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, Clock, CheckCircle, Info, TrendingUp, Zap } from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import ClientReportPreview from "@/components/dashboard/ClientReportPreview";
import { Client } from "@/lib/types";
import { formatDate, getPackageLabel, getCurrentMonthLabel, getPreviousMonthLabel } from "@/lib/utils";
import { DEMO_SEARCH_CONSOLE, DEMO_ANALYTICS, DEMO_ADS } from "@/lib/demo-data";

interface ReportRecord {
  id: string;
  clientId: string;
  clientName: string;
  period: string;
  generatedAt: string;
  status: "ready" | "generating" | "failed";
  highlights?: string[];
}

const DEMO_REPORTS: ReportRecord[] = [
  {
    id: "report-001",
    clientId: "client-001",
    clientName: "Mitchell Plumbing",
    period: "July 2026",
    generatedAt: "2026-08-01T09:00:00Z",
    status: "ready",
    highlights: ["+23% organic clicks", "8 keywords in top 10", "47 keywords targeted"],
  },
  {
    id: "report-002",
    clientId: "client-002",
    clientName: "Bright Interiors",
    period: "July 2026",
    generatedAt: "2026-08-01T09:15:00Z",
    status: "ready",
    highlights: ["+31% organic clicks", "19 keywords in top 10", "ROAS: 3.2×"],
  },
];

const PERIOD_OPTIONS = [
  { value: "current", label: getCurrentMonthLabel() + " (current)" },
  { value: "previous", label: getPreviousMonthLabel() },
  { value: "2-months-ago", label: "2 months ago" },
];

export default function ReportsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [generating, setGenerating] = useState(false);
  const [reports] = useState<ReportRecord[]>(DEMO_REPORTS);
  const [previewClient, setPreviewClient] = useState<Client | null>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleGenerate = async () => {
    if (!selectedClient) return;
    setGenerating(true);
    // Simulate report generation
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(false);
    // Show preview
    setPreviewClient(selectedClient);
  };

  const handlePreview = (clientId: string) => {
    const c = clients.find((cl) => cl.id === clientId);
    if (c) setPreviewClient(c);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Reports"
        subtitle="Monthly SEO & Ads reports — what clients receive every month"
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* What is a report? */}
          <div
            className="flex gap-4 p-5 rounded-xl"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 gradient-brand"
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text mb-1">What clients receive each month</p>
              <p className="text-sm text-text-muted leading-relaxed">
                Every client gets a branded monthly report showing their search rankings, organic traffic, keyword performance, and what Cayde did that month.
                For Ads clients, it includes spend, conversions, and ROAS. Reports are plain-English — no jargon — so clients understand exactly what they&apos;re getting for their money.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Keyword rankings", "Organic traffic", "Google Ads ROAS", "What we did", "Next month's plan"].map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: "var(--color-bg-border)", color: "var(--color-text-muted)" }}
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Generate / Preview Report */}
          <div className="card">
            <h2 className="section-title mb-1">Generate or Preview Report</h2>
            <p className="section-subtitle mb-5">
              Select a client and period to generate a report or preview what it looks like
            </p>

            {loading ? (
              <PageLoader text="Loading clients…" />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Select a client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {getPackageLabel(c.package)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="input w-auto min-w-[180px]"
                  >
                    {PERIOD_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Client info preview */}
                {selectedClient && (
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-bg-border)" }}
                  >
                    <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {selectedClient.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text">{selectedClient.name}</p>
                      <p className="text-xs text-text-muted">{selectedClient.domain} · {getPackageLabel(selectedClient.package)}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          {selectedClient.siteUrl ? (
                            <><CheckCircle className="w-3 h-3 text-success" /> Search Console connected</>
                          ) : (
                            <><Info className="w-3 h-3 text-text-dim" /> Search Console not linked — sample data will be used</>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          {selectedClient.analyticsPropertyId ? (
                            <><CheckCircle className="w-3 h-3 text-success" /> Analytics connected</>
                          ) : (
                            <><Info className="w-3 h-3 text-text-dim" /> Analytics not linked</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => selectedClient && setPreviewClient(selectedClient)}
                    disabled={!selectedClient}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Report
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedClient || generating}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate &amp; Preview
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Report History */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title">Report History</h2>
                <p className="section-subtitle">{reports.length} reports generated · next batch due 1 Sep 2026</p>
              </div>
              <span
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "var(--color-success-dim)", color: "var(--color-success)" }}
              >
                <TrendingUp className="w-3 h-3" />
                All current
              </span>
            </div>

            {reports.length === 0 ? (
              <EmptyState
                title="No reports yet"
                description="Generate your first client report above."
              />
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                    style={{ border: "1px solid var(--color-bg-border)", background: "var(--color-bg-tertiary)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--color-accent-dim)" }}
                    >
                      <FileText className="w-5 h-5 text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-text">{report.clientName}</p>
                        <Badge variant="purple">{report.period}</Badge>
                        {report.status === "ready" && (
                          <Badge variant="green">
                            <CheckCircle className="w-3 h-3" />
                            Ready
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mb-1.5">
                        Generated {formatDate(report.generatedAt)}
                      </p>
                      {report.highlights && (
                        <div className="flex flex-wrap gap-1.5">
                          {report.highlights.map((h) => (
                            <span
                              key={h}
                              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: "var(--color-bg-border)", color: "var(--color-text-muted)" }}
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handlePreview(report.clientId)}
                      className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Automation coming soon */}
          <div
            className="p-6 rounded-xl text-center"
            style={{ border: "1px dashed var(--color-bg-border)" }}
          >
            <div
              className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-3"
            >
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-text mb-1">Automated Monthly Reports</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto mb-3">
              Cayde will automatically generate and email reports to all active clients on the 1st of each month. Coming once Google data connections are fully live.
            </p>
            <Badge variant="gray">In Development</Badge>
          </div>
        </div>
      </main>

      {/* Report Preview Modal */}
      {previewClient && (
        <ClientReportPreview
          client={previewClient}
          scData={DEMO_SEARCH_CONSOLE[previewClient.id as keyof typeof DEMO_SEARCH_CONSOLE] ?? null}
          analyticsData={DEMO_ANALYTICS[previewClient.id as keyof typeof DEMO_ANALYTICS] ?? null}
          adsData={DEMO_ADS[previewClient.id as keyof typeof DEMO_ADS] ?? null}
          onClose={() => setPreviewClient(null)}
        />
      )}
    </div>
  );
}
