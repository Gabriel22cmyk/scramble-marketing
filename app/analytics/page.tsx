"use client";

import { useState, useEffect } from "react";
import { BarChart3, RefreshCw, Globe } from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

interface AccountSummary {
  account: string;
  displayName: string;
  propertySummaries?: {
    property: string;
    displayName: string;
    propertyType?: string;
  }[];
}

interface SearchConsoleSite {
  siteUrl: string;
  permissionLevel: string;
}

export default function AnalyticsPage() {
  const [gaData, setGaData] = useState<{ accountSummaries?: AccountSummary[] } | null>(null);
  const [scData, setScData] = useState<{ siteEntry?: SearchConsoleSite[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gaRes, scRes] = await Promise.allSettled([
        fetch("/api/analytics/properties").then((r) => r.json()),
        fetch("/api/search-console/sites").then((r) => r.json()),
      ]);

      if (gaRes.status === "fulfilled") setGaData(gaRes.value);
      if (scRes.status === "fulfilled") setScData(scRes.value);
      if (gaRes.status === "rejected" && scRes.status === "rejected") {
        throw new Error("Failed to load analytics data");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accountSummaries = gaData?.accountSummaries ?? [];
  const scSites = scData?.siteEntry ?? [];
  const totalProperties = accountSummaries.reduce((sum, acc) => sum + (acc.propertySummaries?.length ?? 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Analytics"
        subtitle="Google Analytics & Search Console overview"
        actions={
          <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {loading ? (
            <PageLoader text="Fetching analytics data…" />
          ) : error ? (
            <ErrorAlert message={error} />
          ) : (
            <>
              {/* GA4 Properties */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <div>
                    <h2 className="section-title">Google Analytics 4</h2>
                    <p className="section-subtitle">{accountSummaries.length} accounts · {totalProperties} properties</p>
                  </div>
                </div>

                {accountSummaries.length === 0 ? (
                  <EmptyState
                    title="No GA4 accounts found"
                    description="Make sure the connected Google account has access to at least one Analytics property."
                  />
                ) : (
                  <div className="space-y-4">
                    {accountSummaries.map((account) => (
                      <div key={account.account} className="border border-bg-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center">
                            <BarChart3 className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text">{account.displayName}</p>
                            <p className="text-xs text-text-muted">{account.account}</p>
                          </div>
                        </div>

                        {account.propertySummaries && account.propertySummaries.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {account.propertySummaries.map((prop) => (
                              <div key={prop.property} className="flex items-center gap-2.5 p-3 rounded-lg bg-bg-tertiary border border-bg-border">
                                <div className="w-1 h-8 rounded-full bg-accent" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-text truncate">{prop.displayName}</p>
                                  <p className="text-xs text-text-muted truncate">{prop.property}</p>
                                </div>
                                {prop.propertyType && (
                                  <Badge variant="purple" className="ml-auto flex-shrink-0">
                                    {prop.propertyType === "PROPERTY_TYPE_ORDINARY" ? "GA4" : prop.propertyType}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-muted">No properties in this account</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Console Sites */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="section-title">Search Console Sites</h2>
                    <p className="section-subtitle">{scSites.length} verified sites</p>
                  </div>
                </div>

                {scSites.length === 0 ? (
                  <EmptyState
                    title="No verified sites"
                    description="Add and verify your clients' sites in Google Search Console, then link them here."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scSites.map((site) => (
                      <div key={site.siteUrl} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary border border-bg-border">
                        <div className="w-8 h-8 rounded-lg bg-primary-dim flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{site.siteUrl}</p>
                          <p className="text-xs text-text-muted">{site.permissionLevel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
