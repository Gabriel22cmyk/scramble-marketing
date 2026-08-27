"use client";

import { useState } from "react";
import {
  Edit3,
  Save,
  X,
  Bot,
  Search,
  DollarSign,
  ListTodo,
  BarChart3,
  Info,
} from "lucide-react";
import { CampaignStrategy, Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface CampaignStrategyPanelProps {
  client: Client;
  onUpdate?: (updated: CampaignStrategy) => void;
}

function StrategyField({
  label,
  icon,
  value,
  placeholder,
  editing,
  rows,
  onChange,
  hint,
  monospace,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  editing: boolean;
  rows?: number;
  onChange: (v: string) => void;
  hint?: string;
  monospace?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-text-dim">{icon}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</span>
      </div>

      {editing ? (
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows ?? 3}
            className={`input resize-y text-sm ${monospace ? "font-mono text-xs" : ""}`}
          />
          {hint && (
            <p className="text-[11px] text-text-dim mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {hint}
            </p>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            <p
              className={`text-sm text-text leading-relaxed whitespace-pre-wrap ${monospace ? "font-mono text-xs bg-bg-tertiary p-3 rounded-lg" : ""}`}
            >
              {value}
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: "var(--color-text-dim)" }}>
              {placeholder} — click Edit to add
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CampaignStrategyPanel({ client, onUpdate }: CampaignStrategyPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CampaignStrategy>(client.campaignStrategy);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const needsAds = client.package === "seo-ads" || client.package === "ads";
  const isEmpty = !client.campaignStrategy.summary && !client.campaignStrategy.targetKeywords;

  const set = (key: keyof CampaignStrategy) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/clients/${client.id}/strategy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          updatedBy: "cayde",
          updatedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      const updated: CampaignStrategy = await res.json();
      setForm(updated);
      onUpdate?.(updated);
      setEditing(false);
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(client.campaignStrategy);
    setSaveError(null);
    setEditing(false);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Bot className="w-4 h-4 text-accent" />
            Campaign Strategy
          </h3>
          <p className="section-subtitle mt-0.5">
            Cayde&apos;s working strategy — built from the business brief above
          </p>
        </div>
        <div className="flex items-center gap-2">
          {client.campaignStrategy.updatedAt && !editing && (
            <span className="text-[11px] text-text-dim">
              Updated {formatDate(client.campaignStrategy.updatedAt)}
            </span>
          )}
          {editing ? (
            <>
              <button onClick={handleCancel} className="btn-ghost flex items-center gap-1.5 text-sm">
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Strategy"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEmpty ? "Write Strategy" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Empty prompt */}
      {isEmpty && !editing && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{
            background: "var(--color-accent-dim)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <Bot className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text">
              Strategy not yet documented
            </p>
            <p className="text-xs text-text-muted mt-0.5 leading-snug">
              Cayde: once you&apos;ve reviewed the business brief, document the campaign strategy here.
              This is your working plan — update it whenever the approach changes.
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div
          className="p-3 rounded-lg text-sm mb-4"
          style={{ background: "var(--color-danger-dim)", color: "var(--color-danger)" }}
        >
          {saveError}
        </div>
      )}

      <div className="space-y-6">
        {/* Strategy summary */}
        <StrategyField
          label="Strategy Summary"
          icon={<BarChart3 className="w-3.5 h-3.5" />}
          value={form.summary}
          placeholder="What we're doing and why — the overall approach, priorities, timeline…"
          editing={editing}
          rows={4}
          onChange={set("summary")}
          hint="Plain English. Gabriel should be able to read this and understand what we're doing."
        />

        {/* Target keywords */}
        <div>
          <div
            className="h-px mb-5"
            style={{ background: "var(--color-bg-border)" }}
          />
          <StrategyField
            label="Target Keywords"
            icon={<Search className="w-3.5 h-3.5" />}
            value={form.targetKeywords}
            placeholder="Priority keyword list with monthly search volumes and target positions…"
            editing={editing}
            rows={8}
            monospace
            onChange={set("targetKeywords")}
            hint="Format however works — tiers, clusters, or a simple list. Include monthly volume where known."
          />
        </div>

        {/* Ads structure — only for Ads packages */}
        {needsAds && (
          <div>
            <div
              className="h-px mb-5"
              style={{ background: "var(--color-bg-border)" }}
            />
            <StrategyField
              label="Ad Campaign Structure"
              icon={<DollarSign className="w-3.5 h-3.5" />}
              value={form.adCampaignStructure}
              placeholder="Campaign names, ad groups, budget allocation, targeting, match types, negative keywords…"
              editing={editing}
              rows={6}
              monospace
              onChange={set("adCampaignStructure")}
              hint="Document the full campaign architecture. Include budget splits and which landing pages each campaign uses."
            />
          </div>
        )}

        {/* Next actions */}
        <div>
          <div
            className="h-px mb-5"
            style={{ background: "var(--color-bg-border)" }}
          />
          <StrategyField
            label="Next Planned Actions"
            icon={<ListTodo className="w-3.5 h-3.5" />}
            value={form.nextActions}
            placeholder="What Cayde intends to do in the next 7–14 days — numbered list of specific tasks…"
            editing={editing}
            rows={4}
            onChange={set("nextActions")}
            hint="Keep this updated. When you complete something, log it in the Activity Log below and update this list."
          />
        </div>
      </div>

      {editing && (
        <div
          className="flex gap-3 mt-6 pt-4"
          style={{ borderTop: "1px solid var(--color-bg-border)" }}
        >
          <button onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Strategy"}
          </button>
        </div>
      )}
    </div>
  );
}
