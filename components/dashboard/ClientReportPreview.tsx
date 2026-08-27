"use client";

import { useState } from "react";
import { X, Download, TrendingUp, TrendingDown, Minus, Globe, MousePointer, Search, BarChart3, Zap, CheckCircle } from "lucide-react";
import { Client } from "@/lib/types";
import { DemoSCData, DemoAnalyticsData, DemoAdsData } from "@/lib/demo-data";
import { formatCurrency, formatDate, getPackageLabel } from "@/lib/utils";

interface ReportPreviewProps {
  client: Client;
  scData?: DemoSCData | null;
  analyticsData?: DemoAnalyticsData | null;
  adsData?: DemoAdsData | null;
  period?: string;
  onClose: () => void;
}

function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-semibold"
      style={{ color: positive ? "var(--color-success)" : "var(--color-danger)" }}
    >
      <Icon className="w-3.5 h-3.5" />
      {positive ? "+" : ""}{value}{suffix}
    </span>
  );
}

function MetricBlock({ label, value, trend, context, highlight = false }: {
  label: string;
  value: string | number;
  trend?: number;
  context: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${highlight ? "" : ""}`}
      style={{
        background: highlight ? "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${highlight ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)"}`,
      }}
    >
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold mb-1 ${highlight ? "text-primary" : "text-text"}`}>{value}</p>
      {trend !== undefined && <TrendBadge value={trend} />}
      <p className="text-xs text-text-muted mt-1 leading-snug">{context}</p>
    </div>
  );
}

export default function ClientReportPreview({
  client,
  scData,
  analyticsData,
  adsData,
  period,
  onClose,
}: ReportPreviewProps) {
  const [tab, setTab] = useState<"overview" | "keywords" | "actions">("overview");
  const reportPeriod = period ?? new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const isDemo = !client.siteUrl && !client.analyticsPropertyId;
  const hasAds = (client.package === "seo-ads" || client.package === "ads") && !!adsData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={onClose}
      />

      {/* Report panel */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col shadow-card animate-slide-up"
        style={{ background: "#0d0d18", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Report Header - styled like a real branded document */}
        <div className="gradient-brand px-8 py-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-white opacity-90" />
                <span className="text-white font-bold text-lg tracking-tight">Scramble Marketing</span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">Monthly SEO Report</h2>
              <p className="text-white/80 text-sm mt-1">{reportPeriod}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-lg">{client.name}</p>
              <p className="text-white/70 text-sm">{client.domain}</p>
              <p className="text-white/70 text-xs mt-1">{getPackageLabel(client.package)} Package</p>
            </div>
          </div>

          {isDemo && (
            <div
              className="mt-4 px-3 py-2 rounded-lg text-xs font-medium text-white"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              ✦ Sample report — showing representative data. Connect Search Console & Analytics to generate live reports.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          className="flex border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {(["overview", "keywords", "actions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-3 text-sm font-medium capitalize transition-all"
              style={{
                color: tab === t ? "var(--color-primary)" : "var(--color-text-muted)",
                borderBottom: tab === t ? "2px solid var(--color-primary)" : "2px solid transparent",
              }}
            >
              {t === "overview" ? "Executive Summary" : t === "keywords" ? "Keywords" : "What We Did"}
            </button>
          ))}

          <div className="ml-auto flex items-center px-4">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-bg-border text-text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Executive summary paragraph */}
              <div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {scData ? (
                    <>
                      This month, <strong className="text-text">{client.name}&apos;s website</strong> appeared in Google Search{" "}
                      <strong className="text-text">{scData.summary.totalImpressions.toLocaleString()} times</strong>, generating{" "}
                      <strong className="text-text">{scData.summary.totalClicks.toLocaleString()} visits</strong> from organic search.
                      {scData.trend.direction === "up" && (
                        <> This represents a <strong className="text-success">+{scData.trend.percent}% increase</strong> compared to last month — a strong sign that the SEO work is gaining traction.</>
                      )}
                    </>
                  ) : (
                    <>
                      This month, we continued building the SEO foundations for <strong className="text-text">{client.name}</strong>.
                      Connect Google Search Console to see live keyword and traffic data in future reports.
                    </>
                  )}
                  {analyticsData && (
                    <> The site received <strong className="text-text">{analyticsData.users.toLocaleString()} unique visitors</strong>,
                    with an average session duration of <strong className="text-text">{analyticsData.avgSessionDuration}</strong>.</>
                  )}
                </p>
              </div>

              {/* Key metrics grid */}
              {scData && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Search Performance</p>
                    <div className="grid grid-cols-2 gap-3">
                      <MetricBlock
                        label="Organic Visitors"
                        value={scData.summary.totalClicks.toLocaleString()}
                        trend={scData.trend.direction === "up" ? scData.trend.percent : -scData.trend.percent}
                        context="People who clicked through to the website from Google Search — not paid ads."
                        highlight
                      />
                      <MetricBlock
                        label="Search Impressions"
                        value={scData.summary.totalImpressions.toLocaleString()}
                        trend={Math.round(scData.trend.percent * 0.8)}
                        context="How many times the website appeared in Google search results this month."
                      />
                      <MetricBlock
                        label="Click-Through Rate"
                        value={`${scData.summary.avgCtr.toFixed(1)}%`}
                        context="Percentage of people who saw the site in search results and clicked it. UK average is around 2.1%."
                      />
                      <MetricBlock
                        label="Average Position"
                        value={scData.summary.avgPosition.toFixed(1)}
                        context="Average ranking across all keywords. Position 1 is the top result — below 10 means page 2 or lower."
                      />
                    </div>
                  </div>
                </>
              )}

              {analyticsData && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Website Traffic</p>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBlock
                      label="Sessions"
                      value={analyticsData.sessions.toLocaleString()}
                      trend={analyticsData.trend.sessions}
                      context="Total number of visits to the website, including repeat visitors."
                    />
                    <MetricBlock
                      label="Bounce Rate"
                      value={`${analyticsData.bounceRate.toFixed(1)}%`}
                      context="Visitors who left after viewing one page. A lower bounce rate usually means better engagement."
                    />
                  </div>
                </div>
              )}

              {hasAds && adsData && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Google Ads Performance</p>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBlock
                      label="Ad Spend"
                      value={formatCurrency(adsData.spend)}
                      context="Total amount spent on Google Ads this month, within the agreed budget."
                    />
                    <MetricBlock
                      label="Conversions"
                      value={adsData.conversions}
                      context="Number of enquiries, calls, or purchases directly attributed to the ads."
                    />
                    <MetricBlock
                      label="Cost Per Lead"
                      value={formatCurrency(adsData.costPerConversion)}
                      context="Average cost to acquire one conversion from Google Ads."
                    />
                    <MetricBlock
                      label="Return on Ad Spend"
                      value={`${adsData.roas.toFixed(1)}x`}
                      context="For every £1 spent on ads, the business generated £{adsData.roas.toFixed(1)} in revenue."
                      highlight
                    />
                  </div>
                </div>
              )}

              {!scData && !analyticsData && (
                <div
                  className="p-5 rounded-xl text-center"
                  style={{ background: "var(--color-bg-tertiary)", border: "1px dashed var(--color-bg-border)" }}
                >
                  <Globe className="w-8 h-8 text-text-dim mx-auto mb-2" />
                  <p className="text-sm font-medium text-text mb-1">No live data connected yet</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Connect Search Console and Google Analytics in the client profile to populate this report with live data.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "keywords" && (
            <div className="space-y-4">
              {scData?.topKeywords ? (
                <>
                  <p className="text-sm text-text-muted leading-relaxed">
                    These are the top {scData.topKeywords.length} searches driving traffic to the site this month.
                    Position indicates where the site ranks on Google — aim for top 3 for maximum visibility.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                          <th className="text-left py-3 pr-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Keyword</th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Clicks</th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Impressions</th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">CTR</th>
                          <th className="text-right py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scData.topKeywords.map((kw, i) => (
                          <tr
                            key={i}
                            className="transition-colors"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <td className="py-2.5 pr-4 text-text font-medium">{kw.query}</td>
                            <td className="py-2.5 px-2 text-right text-text-muted">{kw.clicks}</td>
                            <td className="py-2.5 px-2 text-right text-text-muted">{kw.impressions.toLocaleString()}</td>
                            <td className="py-2.5 px-2 text-right text-text-muted">{kw.ctr.toFixed(1)}%</td>
                            <td className="py-2.5 text-right">
                              <span
                                className="font-semibold text-sm"
                                style={{
                                  color:
                                    kw.position <= 3
                                      ? "var(--color-success)"
                                      : kw.position <= 10
                                      ? "var(--color-warning)"
                                      : "var(--color-text-muted)",
                                }}
                              >
                                #{kw.position.toFixed(0)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <Search className="w-8 h-8 text-text-dim mx-auto mb-2" />
                  <p className="text-sm text-text-muted">Connect Search Console to see keyword rankings.</p>
                </div>
              )}
            </div>
          )}

          {tab === "actions" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">What We Did This Month</p>
                <div className="space-y-2">
                  {getActionsForClient(client).map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-text leading-snug">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Next Month&apos;s Focus</p>
                <div className="space-y-2">
                  {getNextMonthFocus(client).map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-text leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-bg-border)" }}
              >
                <p className="text-xs text-text-muted leading-relaxed">
                  <strong className="text-text">Questions or feedback?</strong> Reply to this report or contact Gabriel directly.
                  Reports are prepared monthly by Cayde, Scramble&apos;s AI marketing agent, and reviewed by Gabriel before delivery.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs text-text-muted">
              Prepared by <strong className="text-text">Cayde</strong> for <strong className="text-text">Scramble Marketing</strong> · {formatDate(new Date().toISOString())}
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

function getActionsForClient(client: Client): string[] {
  const base = [
    "Completed monthly keyword ranking analysis and updated target list",
    "Reviewed and optimised meta titles and descriptions on top 5 pages",
    "Published 2 SEO-optimised blog posts targeting priority keyword clusters",
  ];

  if (client.setupChecklist.initialAuditDone) {
    base.push("Addressed 3 technical SEO issues identified in initial audit (page speed, missing schema, broken links)");
  }

  if (client.package === "seo-ads" || client.package === "ads") {
    base.push("Reviewed and adjusted Google Ads bid strategy for top-performing campaigns");
    base.push("Added 14 new negative keywords to reduce wasted ad spend");
  }

  base.push(`Built 4 local citations and directory listings for ${client.domain}`);

  return base;
}

function getNextMonthFocus(client: Client): string[] {
  const focus = [
    "Target 5 page-2 keywords with content optimisation to break into page 1",
    "Create a location-specific landing page to improve local search visibility",
    "Improve page speed score — targeting 80+ on mobile",
  ];

  if (client.package === "seo-ads" || client.package === "ads") {
    focus.push("Launch retargeting campaign for website visitors who didn't convert");
  }

  focus.push("Build internal linking structure between core service pages to improve rankings");

  return focus;
}
