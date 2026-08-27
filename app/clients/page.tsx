"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import ClientCard from "@/components/dashboard/ClientCard";
import AddClientModal from "@/components/dashboard/AddClientModal";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Client } from "@/lib/types";
import { getPackageLabel } from "@/lib/utils";

const STATUS_FILTERS = ["all", "active", "paused", "churned", "onboarding"];
const PACKAGE_FILTERS = ["all", "seo", "seo-ads", "ads", "content"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPkg = packageFilter === "all" || c.package === packageFilter;
    return matchSearch && matchStatus && matchPkg;
  });

  const activeCount = clients.filter((c) => c.status === "active").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Clients"
        subtitle={`${clients.length} clients · ${activeCount} active`}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filter bar */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-6 p-3 rounded-xl"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-bg-border)",
            }}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--color-text-dim)" }}
              />
              <input
                type="text"
                placeholder="Search clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-8"
                style={{ background: "var(--color-bg-tertiary)" }}
              />
            </div>

            {/* Selects */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2"
                style={{ color: "var(--color-text-dim)" }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium hidden sm:block">Filter</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-auto min-w-[130px]"
                style={{ background: "var(--color-bg-tertiary)" }}
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all"
                      ? "All Statuses"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
                className="input w-auto min-w-[145px]"
                style={{ background: "var(--color-bg-tertiary)" }}
              >
                {PACKAGE_FILTERS.map((p) => (
                  <option key={p} value={p}>
                    {p === "all" ? "All Packages" : getPackageLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count (when filtering) */}
          {(search || statusFilter !== "all" || packageFilter !== "all") &&
            !loading &&
            !error && (
              <p className="text-xs text-text-dim mb-4">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
                {filtered.length !== clients.length &&
                  `(of ${clients.length} total)`}
              </p>
            )}

          {loading ? (
            <PageLoader text="Loading clients…" />
          ) : error ? (
            <ErrorAlert message={error} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={
                clients.length === 0
                  ? "No clients yet"
                  : "No clients match your filters"
              }
              description={
                clients.length === 0
                  ? "Add your first client to get started with tracking and reporting."
                  : "Try adjusting your search or filters."
              }
              action={
                clients.length === 0 ? (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Client
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddClientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
}
