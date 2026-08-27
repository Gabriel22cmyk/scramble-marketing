"use client";

import { useState } from "react";
import {
  Check,
  Circle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Client, SetupChecklist } from "@/lib/types";
import { getSetupProgress } from "@/lib/alerts";

interface SetupChecklistProps {
  client: Client;
  onUpdate?: (updated: SetupChecklist) => void;
}

interface ChecklistStep {
  key: keyof SetupChecklist;
  label: string;
  description: string;
  owner: "gabriel" | "cayde" | "both";
  notApplicable?: boolean;
  howTo?: string;
  howToLink?: string;
}

function getSteps(client: Client): ChecklistStep[] {
  const needsAds = client.package === "seo-ads" || client.package === "ads";
  return [
    {
      key: "clientInfoComplete",
      label: "Client profile created",
      description: "Business name, domain, package, and contact details are on record.",
      owner: "gabriel",
      howTo: "Edit the client profile to fill in any missing basic info.",
    },
    {
      key: "briefReceived",
      label: "Business brief filled in",
      description:
        "Gabriel has filled in the business description, target audience, goals, and budget. This is what Cayde needs to build the campaign.",
      owner: "gabriel",
      howTo:
        "Scroll up to the Business Brief section and click 'Fill in Brief'. Fill in as much detail as possible — the more context, the better the strategy.",
    },
    {
      key: "searchConsoleVerified",
      label: "Search Console verified",
      description:
        "The client's website is added and verified in Google Search Console. Enables keyword ranking tracking and search analytics.",
      owner: "cayde",
      howTo:
        "1. Go to search.google.com/search-console\n2. Add the property (sc-domain: or URL prefix)\n3. Ask the client to verify via DNS record or HTML tag\n4. Once verified, add the site URL in the 'Connect Search Console' field on this page.",
      howToLink: "https://search.google.com/search-console",
    },
    {
      key: "analyticsLinked",
      label: "Google Analytics 4 linked",
      description:
        "A GA4 property is connected. Tracks website traffic, session length, conversions, and user behaviour.",
      owner: "cayde",
      howTo:
        "1. Request Viewer or Editor access to the client's GA4 property\n2. Find the Property ID in GA4 Admin → Property Settings (format: properties/123456789)\n3. Add it in the 'Link Analytics' field on this page.",
      howToLink: "https://analytics.google.com",
    },
    {
      key: "adsLinked",
      label: "Google Ads account linked",
      description:
        "The client's Google Ads account is connected. Required to manage campaigns, track spend, and measure conversions.",
      owner: "cayde",
      howTo:
        "1. Ask the client to grant access in Google Ads (Tools → Access and security)\n2. Or get the Customer ID from top-right of Ads dashboard (format: 123-456-7890)\n3. Add it in the 'Link Google Ads' field on this page.",
      howToLink: "https://ads.google.com",
      notApplicable: !needsAds,
    },
    {
      key: "keywordsAdded",
      label: "Keyword research complete",
      description:
        "Target keywords have been researched and documented in the Campaign Strategy section. We know what search terms to chase and in what priority order.",
      owner: "cayde",
      howTo:
        "Run keyword research using competitor analysis, Google's Keyword Planner, and Search Console data. Document results in the Campaign Strategy → Target Keywords section.",
    },
    {
      key: "initialAuditDone",
      label: "Initial SEO audit done",
      description:
        "A technical SEO audit has been run. We know what's broken or missing on the website and have a priority fix list.",
      owner: "cayde",
      howTo:
        "Run Screaming Frog (or similar) on the client's site. Check for: page speed, meta descriptions, schema markup, broken links, mobile usability. Log findings in the Activity Log.",
    },
    {
      key: "strategyDocumented",
      label: "Campaign strategy written",
      description:
        "Cayde has documented the campaign plan in the Strategy section — what we're doing, target keywords, ad structure, and next actions.",
      owner: "cayde",
      howTo:
        "After completing the audit and keyword research, write the strategy summary in the Campaign Strategy section above. Update it whenever the approach changes.",
    },
    {
      key: "reportScheduled",
      label: "Monthly report scheduled",
      description:
        "Automated monthly reports are set up. The client receives a branded report on the 1st of each month.",
      owner: "both",
      howTo:
        "Go to the Reports page and set up a recurring report for this client.",
    },
  ];
}

export default function SetupChecklistComponent({
  client,
  onUpdate,
}: SetupChecklistProps) {
  const [checklist, setChecklist] = useState<SetupChecklist>(
    client.setupChecklist
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const progress = getSetupProgress({ ...client, setupChecklist: checklist });
  const steps = getSteps(client);
  const completedCount = steps.filter(
    (s) => s.notApplicable || checklist[s.key]
  ).length;

  const toggle = async (key: keyof SetupChecklist, value: boolean) => {
    setSaving(key);
    const updated = { ...checklist, [key]: value };
    setChecklist(updated);
    try {
      await fetch(`/api/clients/${client.id}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      onUpdate?.(updated);
    } catch {
      setChecklist(checklist);
    } finally {
      setSaving(null);
    }
  };

  const ownerColors = {
    gabriel: { bg: "var(--color-accent-dim)", color: "var(--color-accent)" },
    cayde: { bg: "var(--color-primary-dim)", color: "var(--color-primary)" },
    both: { bg: "var(--color-bg-border)", color: "var(--color-text-muted)" },
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="section-title">Setup Checklist</h3>
          <p className="section-subtitle mt-0.5">
            {completedCount} of {steps.filter((s) => !s.notApplicable).length} steps complete
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span
            className="text-2xl font-bold"
            style={{
              color:
                progress === 100
                  ? "var(--color-success)"
                  : "var(--color-primary)",
            }}
          >
            {progress}%
          </span>
          <span className="text-[11px] text-text-dim">done</span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full mb-5"
        style={{ background: "var(--color-bg-border)" }}
      >
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

      {/* Owner legend */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] text-text-dim">Owner:</span>
        {(["gabriel", "cayde", "both"] as const).map((o) => (
          <span
            key={o}
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={ownerColors[o]}
          >
            {o === "both" ? "Gabriel + Cayde" : o === "gabriel" ? "Gabriel" : "Cayde"}
          </span>
        ))}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-1.5">
        {steps.map((step) => {
          const isDone = checklist[step.key];
          const isNA = step.notApplicable;
          const isExpanded = expanded === step.key;
          const isSaving = saving === step.key;
          const ownerStyle = ownerColors[step.owner];

          return (
            <div
              key={step.key}
              className="rounded-xl border transition-all duration-150"
              style={{
                opacity: isNA ? 0.45 : 1,
                borderColor: isDone
                  ? "rgba(34,197,94,0.25)"
                  : "var(--color-bg-border)",
                background: isDone
                  ? "var(--color-success-dim)"
                  : "var(--color-bg-tertiary)",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              <div
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() =>
                  !isNA && setExpanded(isExpanded ? null : step.key)
                }
              >
                {/* Toggle button */}
                <button
                  className="flex-shrink-0 mt-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isNA && !isSaving) toggle(step.key, !isDone);
                  }}
                  disabled={isNA || isSaving}
                  aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                >
                  {isSaving ? (
                    <div
                      className="w-5 h-5 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "var(--color-bg-border)",
                        borderTopColor: "var(--color-primary)",
                      }}
                    />
                  ) : isNA ? (
                    <MinusCircle className="w-5 h-5 text-text-dim" />
                  ) : isDone ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-text-dim" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{
                        color: isNA
                          ? "var(--color-text-dim)"
                          : isDone
                          ? "var(--color-success)"
                          : "var(--color-text)",
                      }}
                    >
                      {step.label}
                    </p>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={ownerStyle}
                    >
                      {step.owner === "both"
                        ? "Both"
                        : step.owner === "gabriel"
                        ? "Gabriel"
                        : "Cayde"}
                    </span>
                    {isNA && (
                      <span className="text-[10px] text-text-dim">
                        (not required)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>

                {!isNA && (
                  <div className="flex-shrink-0 text-text-dim">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>

              {/* Expanded how-to */}
              {isExpanded && !isNA && step.howTo && (
                <div
                  className="px-3.5 pb-3.5 ml-8"
                  style={{ borderTop: "1px solid var(--color-bg-border)" }}
                >
                  <p
                    className="text-xs font-semibold mt-3 mb-1.5"
                    style={{ color: "var(--color-primary)" }}
                  >
                    How to complete:
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                    {step.howTo}
                  </p>
                  {step.howToLink && (
                    <a
                      href={step.howToLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs transition-colors"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Open {step.howToLink.replace("https://", "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {!isDone && (
                    <button
                      onClick={() => toggle(step.key, true)}
                      disabled={!!saving}
                      className="mt-3 text-xs font-medium flex items-center gap-1 transition-colors"
                      style={{ color: "var(--color-success)" }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark as complete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
