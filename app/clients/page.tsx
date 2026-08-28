"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
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
    <>
      {/* Header — centered hero, matches site-wide pattern */}
      <section
        className="text-center relative"
        style={{
          background: "linear-gradient(135deg, #1a2e2a 0%, #1f3a35 50%, #243633 100%)",
          paddingTop: "180px",
          paddingBottom: "64px",
        }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <h1
            className="text-4xl font-extrabold mb-3"
            style={{ color: "#f5f5f0", letterSpacing: "-0.5px" }}
          >
            Clients
          </h1>
          <p className="text-lg mb-8" style={{ color: "#a8a89d" }}>
            {clients.length} total · {activeCount} active
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-base transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #6b8e7f 0%, #7fa592 100%)",
              boxShadow: "0 4px 14px rgba(8, 145, 178, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="py-10 px-6" style={{ background: "#1a2e2a" }}>
        <div className="max-w-5xl mx-auto">
          {/* Filters */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-8 p-5 rounded-2xl"
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#7a7a70" }} />
              <input
                type="text"
                placeholder="Search clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto min-w-[130px]"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="input w-auto min-w-[150px]"
            >
              {PACKAGE_FILTERS.map((p) => (
                <option key={p} value={p}>
                  {p === "all" ? "All Packages" : getPackageLabel(p)}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <PageLoader text="Loading clients…" />
          ) : error ? (
            <ErrorAlert message={error} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={clients.length === 0 ? "No clients yet" : "No clients match your filters"}
              description={
                clients.length === 0
                  ? "Add your first client to get started with tracking and reporting."
                  : "Try adjusting your search or filters."
              }
              action={
                clients.length === 0 ? (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm"
                    style={{
                      background: "linear-gradient(135deg, #6b8e7f 0%, #7fa592 100%)",
                      boxShadow: "0 4px 14px rgba(8, 145, 178, 0.25)",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add First Client
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AddClientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchClients}
      />
    </>
  );
}
