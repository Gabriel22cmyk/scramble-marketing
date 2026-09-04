"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  BarChart3,
  Search,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Calendar,
  Mail,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";
import { PageLoader, LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import SetupChecklistComponent from "@/components/dashboard/SetupChecklist";
import ActivityLog from "@/components/dashboard/ActivityLog";
import BusinessBriefPanel from "@/components/dashboard/BusinessBriefPanel";
import CampaignStrategyPanel from "@/components/dashboard/CampaignStrategyPanel";
import ClientReportPreview from "@/components/dashboard/ClientReportPreview";
import WeeklySummaryCard from "@/components/dashboard/WeeklySummaryCard";
import { Client, SetupChecklist } from "@/lib/types";
import { formatDate, getPackageLabel } from "@/lib/utils";
import { getClientAlerts, getSetupProgress } from "@/lib/alerts";
import {
  DEMO_SEARCH_CONSOLE,
  DEMO_ANALYTICS,
  DEMO_ADS,
} from "@/lib/demo-data";

// ─── Connect prompt ────────────────────────────────────────────────────────

function ConnectPrompt({
  title,
  description,
  instruction,
  fieldName,
  clientId,
  onConnected,
}: {
  title: string;
  description: string;
  instruction: string;
  fieldName: string;
  clientId: string;
  onConnected: () => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: value.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onConnected();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="p-5 rounded-xl text-center"
      style={{
        background: "var(--color-bg-tertiary)",
        border: "1px dashed var(--color-bg-border)",
      }}
    >
      <AlertTriangle className="w-6 h-6 text-text-dim mx-auto mb-2" />
      <p className="text-sm font-semibold text-text mb-1">{title}</p>
      <p className="text-xs text-text-muted leading-relaxed mb-2 max-w-sm mx-auto">
        {description}
      </p>
      <p className="text-xs italic text-text-dim mb-3 max-w-sm mx-auto">{instruction}</p>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          Connect Now
        </button>
      ) : (
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              fieldName === "siteUrl"
                ? "sc-domain:example.co.uk"
                : fieldName === "analyticsPropertyId"
                ? "properties/123456789"
                : "123-456-7890"
            }
            className="input text-sm flex-1"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving || !value.trim()}
            className="btn-primary text-sm"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  );
}

// ─── Search Console panel ─────────────────────────────────────────────────

function SearchConsolePanel({
  client,
  onConnected,
}: {
  client: Client;
  onConnected: () => void;
}) {
  const [data, setData] = useState<{
    rows?: {
      keys: string[];
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(false);
  const demoData = DEMO_SEARCH_CONSOLE[client.id as keyof typeof DEMO_SEARCH_CONSOLE];

  const loadLive = async () => {
    if (!client.siteUrl) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const res = await fetch(
        `/api/search-console/analytics?siteUrl=${encodeURIComponent(client.siteUrl)}&startDate=${start}&endDate=${today}&dimensions=query&rowLimit=10`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "API error");
      setData(json);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client.siteUrl) loadLive();
  }, [client.siteUrl]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <div>
            <h3 className="section-title">Search Console</h3>
            <p className="text-xs text-text-muted">
              Keyword rankings, impressions, and organic clicks from Google Search
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {demoData && !client.siteUrl && (
            <button
              onClick={() => setUseDemo(!useDemo)}
              className="text-xs font-medium px-2 py-1 rounded transition-colors"
              style={{
                background: useDemo ? "var(--color-primary-dim)" : "var(--color-bg-border)",
                color: useDemo ? "var(--color-primary)" : "var(--color-text-muted)",
              }}
            >
              {useDemo ? "Sample data" : "Preview sample"}
            </button>
          )}
          {client.siteUrl && (
            <button onClick={loadLive} disabled={loading} className="btn-ghost p-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {!client.siteUrl && !useDemo ? (
        <ConnectPrompt
          title="Search Console not connected"
          description="Without Search Console, keyword rankings are invisible. We can't track whether SEO is working."
          instruction="Complete the Search Console verification step in the checklist, then enter the site URL below."
          fieldName="siteUrl"
          clientId={client.id}
          onConnected={onConnected}
        />
      ) : loading ? (
        <LoadingSpinner text="Fetching search data…" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : useDemo && demoData ? (
        <SearchConsoleTable
          rows={demoData.topKeywords}
          summary={demoData.summary}
          trend={demoData.trend}
          isDemo
        />
      ) : data?.rows && data.rows.length > 0 ? (
        <SearchConsoleTable
          rows={data.rows.map((r) => ({
            query: r.keys[0],
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr * 100,
            position: r.position,
          }))}
          summary={{
            totalClicks: data.rows.reduce((s, r) => s + r.clicks, 0),
            totalImpressions: data.rows.reduce((s, r) => s + r.impressions, 0),
            avgCtr: (data.rows.reduce((s, r) => s + r.ctr, 0) / data.rows.length) * 100,
            avgPosition: data.rows.reduce((s, r) => s + r.position, 0) / data.rows.length,
          }}
        />
      ) : (
        <EmptyState
          title="No search data yet"
          description="Data will appear once Search Console starts recording impressions. This can take a few days after verification."
        />
      )}
    </div>
  );
}

function SearchConsoleTable({
  rows,
  summary,
  trend,
  isDemo,
}: {
  rows: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  summary: { totalClicks: number; totalImpressions: number; avgCtr: number; avgPosition: number };
  trend?: { direction: string; percent: number };
  isDemo?: boolean;
}) {
  return (
    <>
      {isDemo && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-medium"
          style={{ background: "var(--color-bg-border)", color: "var(--color-text-dim)" }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Sample data — representative results for a local service business at this stage
          {trend && (
            <span className="ml-auto text-success font-semibold">
              +{trend.percent}% this month
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Clicks", value: summary.totalClicks.toLocaleString(), context: "Organic visitors from Google" },
          { label: "Impressions", value: summary.totalImpressions.toLocaleString(), context: "Times appeared in search" },
          { label: "Avg CTR", value: `${summary.avgCtr.toFixed(1)}%`, context: "Click-through rate" },
          { label: "Avg Position", value: summary.avgPosition.toFixed(1), context: "Google ranking", highlight: true },
        ].map(({ label, value, context, highlight }) => (
          <div
            key={label}
            className="p-3 rounded-xl"
            style={{
              background: highlight ? "var(--color-primary-dim)" : "var(--color-bg-tertiary)",
              border: `1px solid ${highlight ? "rgba(99,102,241,0.3)" : "var(--color-bg-border)"}`,
            }}
          >
            <p className="text-xs text-text-muted">{label}</p>
            <p className={`text-xl font-bold mt-1 ${highlight ? "text-primary" : "text-text"}`}>{value}</p>
            <p className="text-[10px] text-text-dim mt-0.5">{context}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-bg-border)" }}>
              <th className="text-left pb-2 pr-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Keyword</th>
              <th className="text-right pb-2 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Clicks</th>
              <th className="text-right pb-2 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Impr.</th>
              <th className="text-right pb-2 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">CTR</th>
              <th className="text-right pb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Position</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-bg-tertiary transition-colors"
                style={{ borderBottom: "1px solid var(--color-bg-border)" }}
              >
                <td className="py-2 pr-4 text-text truncate max-w-[200px]">{row.query}</td>
                <td className="py-2 px-2 text-right text-text-muted">{row.clicks}</td>
                <td className="py-2 px-2 text-right text-text-muted">{row.impressions.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-text-muted">{row.ctr.toFixed(1)}%</td>
                <td className="py-2 text-right">
                  <span
                    className="font-bold"
                    style={{
                      color:
                        row.position <= 3
                          ? "var(--color-success)"
                          : row.position <= 10
                          ? "var(--color-warning)"
                          : "var(--color-text-muted)",
                    }}
                  >
                    #{Math.round(row.position)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Analytics panel ──────────────────────────────────────────────────────

function AnalyticsPanel({ client, onConnected }: { client: Client; onConnected: () => void }) {
  const [data, setData] = useState<{
    totals?: { metricValues: { value: string }[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(false);
  const demoData = DEMO_ANALYTICS[client.id as keyof typeof DEMO_ANALYTICS];

  const loadLive = async () => {
    if (!client.analyticsPropertyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/analytics/report?propertyId=${encodeURIComponent(client.analyticsPropertyId)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "API error");
      setData(json);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client.analyticsPropertyId) loadLive();
  }, [client.analyticsPropertyId]);

  const totals = data?.totals?.[0]?.metricValues;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <div>
            <h3 className="section-title">Google Analytics — Last 30 Days</h3>
            <p className="text-xs text-text-muted">
              Traffic, sessions, user behaviour
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {demoData && !client.analyticsPropertyId && (
            <button
              onClick={() => setUseDemo(!useDemo)}
              className="text-xs font-medium px-2 py-1 rounded transition-colors"
              style={{
                background: useDemo ? "var(--color-accent-dim)" : "var(--color-bg-border)",
                color: useDemo ? "var(--color-accent)" : "var(--color-text-muted)",
              }}
            >
              {useDemo ? "Sample data" : "Preview sample"}
            </button>
          )}
          {client.analyticsPropertyId && (
            <button onClick={loadLive} disabled={loading} className="btn-ghost p-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {!client.analyticsPropertyId && !useDemo ? (
        <ConnectPrompt
          title="Google Analytics not linked"
          description="Without Analytics, website traffic is untracked. We can't measure sessions, users, or conversions."
          instruction="Get the GA4 property ID from Analytics Admin → Property Settings. Format: properties/123456789."
          fieldName="analyticsPropertyId"
          clientId={client.id}
          onConnected={onConnected}
        />
      ) : loading ? (
        <LoadingSpinner text="Loading analytics…" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : useDemo && demoData ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Sessions", value: demoData.sessions.toLocaleString(), sub: `+${demoData.trend.sessions}% vs last month`, context: "Total visits", highlight: true },
            { label: "Unique Visitors", value: demoData.users.toLocaleString(), sub: `+${demoData.trend.users}%`, context: "Individual people" },
            { label: "Bounce Rate", value: `${demoData.bounceRate.toFixed(1)}%`, context: "Left after 1 page" },
            { label: "Avg. Visit", value: demoData.avgSessionDuration, context: "Time on site" },
          ].map(({ label, value, sub, context, highlight }) => (
            <div
              key={label}
              className="p-3 rounded-xl"
              style={{
                background: highlight ? "var(--color-accent-dim)" : "var(--color-bg-tertiary)",
                border: `1px solid ${highlight ? "rgba(168,85,247,0.3)" : "var(--color-bg-border)"}`,
              }}
            >
              <p className="text-xs text-text-muted">{label}</p>
              <p className={`text-xl font-bold mt-1 ${highlight ? "text-accent" : "text-text"}`}>{value}</p>
              {sub && <p className="text-xs font-medium text-success">{sub}</p>}
              <p className="text-[10px] text-text-dim mt-0.5">{context}</p>
            </div>
          ))}
        </div>
      ) : totals ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Sessions", value: parseInt(totals[0]?.value ?? "0").toLocaleString(), context: "Total visits", highlight: true },
            { label: "Active Users", value: parseInt(totals[1]?.value ?? "0").toLocaleString(), context: "Individual visitors" },
            { label: "Bounce Rate", value: `${(parseFloat(totals[2]?.value ?? "0") * 100).toFixed(1)}%`, context: "Left after 1 page" },
            { label: "Avg. Session", value: `${Math.floor(parseFloat(totals[3]?.value ?? "0") / 60)}m ${Math.floor(parseFloat(totals[3]?.value ?? "0") % 60)}s`, context: "Time on site" },
          ].map(({ label, value, context, highlight }) => (
            <div
              key={label}
              className="p-3 rounded-xl"
              style={{
                background: highlight ? "var(--color-accent-dim)" : "var(--color-bg-tertiary)",
                border: `1px solid ${highlight ? "rgba(168,85,247,0.3)" : "var(--color-bg-border)"}`,
              }}
            >
              <p className="text-xs text-text-muted">{label}</p>
              <p className={`text-xl font-bold mt-1 ${highlight ? "text-accent" : "text-text"}`}>{value}</p>
              <p className="text-[10px] text-text-dim mt-0.5">{context}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No analytics data yet" description="Data will appear once GA4 starts recording traffic." />
      )}
    </div>
  );
}

// ─── Ads panel ────────────────────────────────────────────────────────────

function AdsPanel({ client, onConnected }: { client: Client; onConnected: () => void }) {
  const needsAds = client.package === "seo-ads" || client.package === "ads";
  const demoData = DEMO_ADS[client.id as keyof typeof DEMO_ADS];
  const [useDemo, setUseDemo] = useState(false);

  if (!needsAds) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-success" />
          <div>
            <h3 className="section-title">Google Ads Performance</h3>
            <p className="text-xs text-text-muted">
              Spend, conversions, and ROAS
              {client.businessBrief.adsBudget
                ? ` — £${client.businessBrief.adsBudget.toLocaleString()}/month budget`
                : ""}
            </p>
          </div>
        </div>
        {demoData && !client.adsCustomerId && (
          <button
            onClick={() => setUseDemo(!useDemo)}
            className="text-xs font-medium px-2 py-1 rounded transition-colors"
            style={{
              background: useDemo ? "var(--color-success-dim)" : "var(--color-bg-border)",
              color: useDemo ? "var(--color-success)" : "var(--color-text-muted)",
            }}
          >
            {useDemo ? "Sample data" : "Preview sample"}
          </button>
        )}
      </div>

      {!client.adsCustomerId && !useDemo ? (
        <ConnectPrompt
          title="Google Ads not linked"
          description={`${client.name} is on the ${getPackageLabel(client.package)} package. Link the Ads account to track spend and conversions.`}
          instruction="Get the Customer ID from Google Ads (top right when logged in). Format: 123-456-7890."
          fieldName="adsCustomerId"
          clientId={client.id}
          onConnected={onConnected}
        />
      ) : useDemo && demoData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Monthly Spend", value: `£${demoData.spend.toLocaleString()}`, context: "Within budget" },
              { label: "Conversions", value: demoData.conversions, context: "Enquiries from ads", highlight: true },
              { label: "Cost Per Lead", value: `£${demoData.costPerConversion.toFixed(0)}`, context: "Per enquiry" },
              { label: "ROAS", value: `${demoData.roas.toFixed(1)}×`, context: "Return per £1 spent", highlight: true },
            ].map(({ label, value, context, highlight }) => (
              <div
                key={label}
                className="p-3 rounded-xl"
                style={{
                  background: highlight ? "var(--color-success-dim)" : "var(--color-bg-tertiary)",
                  border: `1px solid ${highlight ? "rgba(34,197,94,0.3)" : "var(--color-bg-border)"}`,
                }}
              >
                <p className="text-xs text-text-muted">{label}</p>
                <p className={`text-xl font-bold mt-1 ${highlight ? "text-success" : "text-text"}`}>{value}</p>
                <p className="text-[10px] text-text-dim mt-0.5">{context}</p>
              </div>
            ))}
          </div>
          {demoData.campaigns.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-bg-border)" }}
            >
              <div>
                <p className="text-sm font-medium text-text">{c.name}</p>
                <p className="text-xs text-text-muted">£{c.spend} · {c.clicks} clicks</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-success">{c.roas.toFixed(1)}× ROAS</p>
                <p className="text-xs text-text-muted">{c.conversions} conversions</p>
              </div>
            </div>
          ))}
        </div>
      ) : client.adsCustomerId ? (
        <p className="text-sm text-text-muted py-4 text-center">
          Ads account linked ({client.adsCustomerId}). Live campaign data will appear here.
        </p>
      ) : null}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const loadClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Not found");
      setClient(await res.json());
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClient(); }, [id]);

  if (loading) return (
    <div className="flex flex-col h-full overflow-hidden">
      
      <PageLoader text="Loading client…" />
    </div>
  );

  if (error || !client) return (
    <div className="flex flex-col h-full overflow-hidden">
      
      <div className="p-6">
        <ErrorAlert message={error ?? "Client not found"} />
        <Link href="/clients" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
      </div>
    </div>
  );

  const handleChecklistUpdate = (updated: SetupChecklist) =>
    setClient((c) => c ? { ...c, setupChecklist: updated } : c);

  const initials = client.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const progress = getSetupProgress(client);
  const alerts = getClientAlerts(client);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const hasDemoSC = !!DEMO_SEARCH_CONSOLE[client.id as keyof typeof DEMO_SEARCH_CONSOLE];

  const statusBadgeVariant = (
    client.status === "active" ? "green" :
    client.status === "paused" ? "amber" :
    client.status === "churned" ? "red" : "indigo"
  ) as "green" | "amber" | "red" | "indigo";

  const pkgBadgeVariant = (
    client.package === "seo" ? "indigo" :
    client.package === "seo-ads" ? "purple" : "green"
  ) as "indigo" | "purple" | "green";

  return (
    <div className="min-h-screen" style={{ background: "#1a2e2a" }}>
      <section className="pt-24 pb-5 px-6" style={{ background: "linear-gradient(180deg, #1f3a35 0%, #1a2e2a 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/clients" className="text-sm font-medium flex items-center gap-1 transition-colors" style={{ color: "#6b8e7f" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Link>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-extrabold mb-0.5" style={{ color: "#f5f5f0", letterSpacing: "-0.5px" }}>{client.name}</h1>
              <p className="text-sm" style={{ color: "#a8a89d" }}>{client.domain} · {getPackageLabel(client.package)}</p>
            </div>
            <button
              onClick={() => setShowReport(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <FileText className="w-3.5 h-3.5" /> Preview Report
            </button>
          </div>
        </div>
      </section>

      <section className="py-5 px-6">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* ── Client header ── */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl gradient-brand flex items-center justify-center text-white text-xl font-bold flex-shrink-0 relative"
              >
                {initials}
                {criticalAlerts.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ border: "2px solid var(--color-bg-card)" }}
                  >
                    {criticalAlerts.length}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-text">{client.name}</h1>
                  <Badge variant={statusBadgeVariant}>
                    <StatusDot status={client.status as "active" | "paused" | "churned" | "onboarding"} size="sm" />
                    {client.status}
                  </Badge>
                  <Badge variant={pkgBadgeVariant}>{getPackageLabel(client.package)}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-text-muted mb-3">
                  <a
                    href={`https://${client.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {client.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Client since {formatDate(client.startDate)}
                  </span>
                  {client.contactEmail && (
                    <a
                      href={`mailto:${client.contactEmail}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {client.contactEmail}
                    </a>
                  )}
                  {client.businessBrief.seoRetainerFee && (
                    <span className="font-semibold" style={{ color: "var(--color-success)" }}>
                      £{client.businessBrief.seoRetainerFee.toLocaleString()}/mo
                      {client.businessBrief.adsBudget
                        ? ` + £${client.businessBrief.adsBudget.toLocaleString()}/mo ads`
                        : ""}
                    </span>
                  )}
                </div>

                {/* Setup progress */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">Setup progress</span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: progress === 100 ? "var(--color-success)" : "var(--color-primary)" }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--color-bg-border)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background:
                            progress === 100
                              ? "var(--color-success)"
                              : "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                        }}
                      />
                    </div>
                  </div>
                  {alerts.length > 0 && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{
                        background: criticalAlerts.length > 0 ? "var(--color-danger-dim)" : "var(--color-warning-dim)",
                        color: criticalAlerts.length > 0 ? "var(--color-danger)" : "var(--color-warning)",
                      }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {alerts.length} alert{alerts.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Alerts ── */}
          {alerts.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Action Needed
              </h3>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 p-3.5 rounded-xl"
                    style={{
                      background:
                        alert.severity === "critical"
                          ? "var(--color-danger-dim)"
                          : alert.severity === "warning"
                          ? "var(--color-warning-dim)"
                          : "var(--color-primary-dim)",
                      border: `1px solid ${
                        alert.severity === "critical"
                          ? "rgba(239,68,68,0.2)"
                          : alert.severity === "warning"
                          ? "rgba(245,158,11,0.2)"
                          : "rgba(99,102,241,0.2)"
                      }`,
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-text">{alert.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-snug">{alert.description}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded self-start flex-shrink-0"
                      style={{
                        background:
                          alert.severity === "critical"
                            ? "rgba(239,68,68,0.15)"
                            : alert.severity === "warning"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(99,102,241,0.15)",
                        color:
                          alert.severity === "critical"
                            ? "var(--color-danger)"
                            : alert.severity === "warning"
                            ? "var(--color-warning)"
                            : "var(--color-primary)",
                      }}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Business Brief + Campaign Strategy (two-column when wide) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <BusinessBriefPanel
              client={client}
              onUpdate={(brief) => setClient((c) => c ? { ...c, businessBrief: brief } : c)}
            />
            <div className="space-y-4">
              <CampaignStrategyPanel
                client={client}
                onUpdate={(strategy) => setClient((c) => c ? { ...c, campaignStrategy: strategy } : c)}
              />
            </div>
          </div>

          {/* ── Data panels ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 space-y-4">
              <SearchConsolePanel client={client} onConnected={loadClient} />
              <AnalyticsPanel client={client} onConnected={loadClient} />
              <AdsPanel client={client} onConnected={loadClient} />
            </div>
            <div className="space-y-4">
              <WeeklySummaryCard clientId={client.id} />
              <SetupChecklistComponent client={client} onUpdate={handleChecklistUpdate} />
            </div>
          </div>

          {/* ── Activity Log ── */}
          <ActivityLog clientId={client.id} notes={client.notes ?? []} />
        </div>
      </section>

      {showReport && (
        <ClientReportPreview
          client={client}
          scData={hasDemoSC ? DEMO_SEARCH_CONSOLE[client.id as keyof typeof DEMO_SEARCH_CONSOLE] : null}
          analyticsData={DEMO_ANALYTICS[client.id as keyof typeof DEMO_ANALYTICS] ?? null}
          adsData={DEMO_ADS[client.id as keyof typeof DEMO_ADS] ?? null}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
