"use client";

import { useState } from "react";
import {
  Edit3,
  Save,
  X,
  Target,
  Users,
  MapPin,
  Wrench,
  Trophy,
  Building2,
  PoundSterling,
  MessageSquare,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { BusinessBrief, Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface BusinessBriefPanelProps {
  client: Client;
  onUpdate?: (updated: BusinessBrief) => void;
}

interface BriefField {
  key: keyof BusinessBrief;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  type?: "textarea" | "number" | "text";
  rows?: number;
  prefix?: string;
  hint?: string;
}

const FIELDS: BriefField[] = [
  {
    key: "description",
    label: "About the Business",
    icon: Building2,
    type: "textarea",
    rows: 3,
    placeholder: "What the business does, who runs it, how long trading…",
    hint: "The full context Cayde needs to understand the business.",
  },
  {
    key: "targetAudience",
    label: "Ideal Customer",
    icon: Users,
    type: "textarea",
    rows: 2,
    placeholder: "Who is the perfect client? Age, location, trigger for buying…",
    hint: "Shapes keyword intent and ad targeting.",
  },
  {
    key: "businessGoals",
    label: "Business Goals",
    icon: Trophy,
    type: "textarea",
    rows: 2,
    placeholder: "What does success look like? More calls, online sales, brand visibility…",
    hint: "Defines what Cayde optimises for.",
  },
  {
    key: "serviceArea",
    label: "Service Area / Location",
    icon: MapPin,
    type: "text",
    placeholder: "e.g. South Birmingham, 8 mile radius from B15",
    hint: "For local SEO landing pages and geo-targeting.",
  },
  {
    key: "keyServices",
    label: "Key Services to Prioritise",
    icon: Wrench,
    type: "textarea",
    rows: 2,
    placeholder: "Which services/products should campaigns focus on first?",
    hint: "Highest-margin or highest-intent services first.",
  },
  {
    key: "competitors",
    label: "Known Competitors",
    icon: Target,
    type: "textarea",
    rows: 2,
    placeholder: "Businesses competing for the same customers…",
    hint: "Used for competitor gap analysis and keyword research.",
  },
  {
    key: "existingAssets",
    label: "Existing Digital Assets",
    icon: Globe,
    type: "textarea",
    rows: 2,
    placeholder: "Website, GBP, social accounts, Shopify, press mentions…",
    hint: "What already exists that we can build on.",
  },
  {
    key: "additionalNotes",
    label: "Notes for Cayde",
    icon: MessageSquare,
    type: "textarea",
    rows: 2,
    placeholder: "Anything else — client personality, what to avoid, specific requests…",
    hint: "Free-text catch-all for anything that doesn't fit above.",
  },
];

function DisplayValue({ value, placeholder }: { value: string; placeholder: string }) {
  if (!value) {
    return (
      <p className="text-sm italic" style={{ color: "var(--color-text-dim)" }}>
        {placeholder}
      </p>
    );
  }
  return (
    <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{value}</p>
  );
}

export default function BusinessBriefPanel({ client, onUpdate }: BusinessBriefPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BusinessBrief>(client.businessBrief);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEmpty = !client.businessBrief.description && !client.businessBrief.businessGoals;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/clients/${client.id}/brief`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, updatedBy: "gabriel", updatedAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      const updated: BusinessBrief = await res.json();
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
    setForm(client.businessBrief);
    setSaveError(null);
    setEditing(false);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Business Brief
          </h3>
          <p className="section-subtitle mt-0.5">
            Gabriel fills this in — it&apos;s Cayde&apos;s brief for building the campaign
          </p>
        </div>
        <div className="flex items-center gap-2">
          {client.businessBrief.updatedAt && !editing && (
            <span className="text-[11px] text-text-dim">
              Updated {formatDate(client.businessBrief.updatedAt)}
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
                {saving ? "Saving…" : "Save Brief"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEmpty ? "Fill in Brief" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Empty state prompt */}
      {isEmpty && !editing && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{
            background: "var(--color-warning-dim)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text">
              Brief not filled in yet
            </p>
            <p className="text-xs text-text-muted mt-0.5 leading-snug">
              Cayde can&apos;t build a campaign strategy without knowing what the business does,
              their goals, and their budget. Gabriel needs to fill this in after talking to the client.
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

      {/* Budget row — shown in both modes */}
      <div
        className="grid grid-cols-2 gap-3 p-4 rounded-xl mb-5"
        style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-bg-border)" }}
      >
        <div>
          <p className="text-xs text-text-muted flex items-center gap-1 mb-1">
            <PoundSterling className="w-3 h-3" />
            SEO Retainer
          </p>
          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-text-muted text-sm">£</span>
              <input
                type="number"
                min="0"
                step="50"
                value={form.seoRetainerFee ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, seoRetainerFee: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="0"
                className="input text-sm w-24"
              />
              <span className="text-text-muted text-xs">/month</span>
            </div>
          ) : (
            <p className="text-xl font-bold text-text">
              {form.seoRetainerFee ? `£${form.seoRetainerFee.toLocaleString()}/mo` : <span className="text-text-dim text-sm">Not set</span>}
            </p>
          )}
        </div>

        {(client.package === "seo-ads" || client.package === "ads") && (
          <div>
            <p className="text-xs text-text-muted flex items-center gap-1 mb-1">
              <PoundSterling className="w-3 h-3" />
              Ads Budget
            </p>
            {editing ? (
              <div className="flex items-center gap-1">
                <span className="text-text-muted text-sm">£</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={form.adsBudget ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, adsBudget: e.target.value ? parseFloat(e.target.value) : null }))}
                  placeholder="0"
                  className="input text-sm w-24"
                />
                <span className="text-text-muted text-xs">/month</span>
              </div>
            ) : (
              <p className="text-xl font-bold text-text">
                {form.adsBudget ? `£${form.adsBudget.toLocaleString()}/mo` : <span className="text-text-dim text-sm">Not set</span>}
              </p>
            )}
          </div>
        )}
      </div>

      {/* All brief fields */}
      <div className="space-y-5">
        {FIELDS.map((field) => {
          const Icon = field.icon;
          const value = (form[field.key] as string) ?? "";

          return (
            <div key={field.key}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-text-dim" />
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  {field.label}
                </span>
              </div>

              {editing ? (
                <div>
                  {field.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={field.rows ?? 2}
                      className="input resize-none text-sm"
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="input text-sm"
                    />
                  )}
                  {field.hint && (
                    <p className="text-[11px] text-text-dim mt-1">{field.hint}</p>
                  )}
                </div>
              ) : (
                <div
                  className="pl-1 cursor-pointer group"
                  onClick={() => setEditing(true)}
                >
                  <DisplayValue value={value} placeholder={`Click to add: ${field.placeholder}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar at bottom when editing */}
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
            {saving ? "Saving…" : "Save Brief"}
          </button>
        </div>
      )}
    </div>
  );
}
