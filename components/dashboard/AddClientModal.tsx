"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ArrowRight,
  CheckCircle,
  Building2,
  Target,
  PoundSterling,
  Plug,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormState {
  // SECTION 1 — The Business
  name: string;
  domain: string;
  contactEmail: string;
  description: string;
  keyServices: string;
  serviceArea: string;
  existingAssets: string;
  competitors: string;
  // SECTION 2 — Goals & Budget
  package: string;
  businessGoals: string;
  targetAudience: string;
  seoRetainerFee: string;
  adsBudget: string;
  // SECTION 3 — Notes for agent
  additionalNotes: string;
  // SECTION 4 — Technical (optional)
  siteUrl: string;
  analyticsPropertyId: string;
  adsCustomerId: string;
}

const EMPTY_FORM: FormState = {
  name: "", domain: "", contactEmail: "", description: "",
  keyServices: "", serviceArea: "", existingAssets: "", competitors: "",
  package: "seo", businessGoals: "", targetAudience: "",
  seoRetainerFee: "", adsBudget: "",
  additionalNotes: "",
  siteUrl: "", analyticsPropertyId: "", adsCustomerId: "",
};

function SectionHeader({
  number,
  icon,
  title,
  subtitle,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      >
        {number}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-muted">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block mb-1.5">
      <span className="text-xs font-semibold text-text-muted">
        {children}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      {hint && <span className="block text-[11px] text-text-dim mt-0.5">{hint}</span>}
    </label>
  );
}

export default function AddClientModal({ open, onClose, onSuccess }: AddClientModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  if (!open) return null;

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const needsAds = form.package === "seo-ads" || form.package === "ads";

  const handleClose = () => {
    setCreated(null);
    setError(null);
    setForm(EMPTY_FORM);
    setShowTechnical(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        domain: form.domain.trim(),
        package: form.package,
        contactEmail: form.contactEmail || null,
        siteUrl: form.siteUrl || null,
        analyticsPropertyId: form.analyticsPropertyId || null,
        adsCustomerId: form.adsCustomerId || null,
        businessBrief: {
          description: form.description,
          targetAudience: form.targetAudience,
          businessGoals: form.businessGoals,
          serviceArea: form.serviceArea,
          keyServices: form.keyServices,
          competitors: form.competitors,
          existingAssets: form.existingAssets,
          seoRetainerFee: form.seoRetainerFee ? parseFloat(form.seoRetainerFee) : null,
          adsBudget: form.adsBudget ? parseFloat(form.adsBudget) : null,
          additionalNotes: form.additionalNotes,
          updatedAt: new Date().toISOString(),
          updatedBy: "gabriel",
        },
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create client");
      }
      const client = await res.json();
      setCreated({ id: client.id, name: client.name });
      onSuccess?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const goToClient = () => {
    if (created) {
      handleClose();
      router.push(`/clients/${created.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={handleClose}
      />

      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-card animate-slide-up flex flex-col overflow-hidden"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-bg-border)",
          maxHeight: "92vh",
        }}
      >
        {/* ── Success state ── */}
        {created ? (
          <div className="p-10 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-success-dim)" }}
            >
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">
              {created.name} added!
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-8 max-w-sm mx-auto">
              The business brief has been saved. Go to the client profile — Cayde will
              review the brief and begin building the campaign strategy.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleClose} className="btn-secondary">
                Done
              </button>
              <button
                onClick={goToClient}
                className="btn-primary flex items-center gap-2"
              >
                Open Profile &amp; Setup
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Modal header ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--color-bg-border)" }}
            >
              <div>
                <h2 className="text-lg font-bold text-text">New Client Intake</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Gabriel fills this in — it becomes Cayde&apos;s brief for building the campaign
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-bg-border text-text-muted hover:text-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Scrollable form ── */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto"
            >
              <div className="px-6 py-5 space-y-8">
                {error && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      background: "var(--color-danger-dim)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "var(--color-danger)",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* ── SECTION 1: The Business ── */}
                <section>
                  <SectionHeader
                    number="1"
                    icon={<Building2 className="w-4 h-4" />}
                    title="The Business"
                    subtitle="Basic info and what the client does"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <FieldLabel required>Business Name</FieldLabel>
                      <input
                        required
                        value={form.name}
                        onChange={set("name")}
                        placeholder="e.g. Mitchell Plumbing"
                        className="input"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <FieldLabel required hint="Without https:// or www">Website Domain</FieldLabel>
                      <input
                        required
                        value={form.domain}
                        onChange={set("domain")}
                        placeholder="example.co.uk"
                        className="input"
                      />
                    </div>
                    <div className="col-span-2">
                      <FieldLabel required hint="In your own words — what does this business do? Who runs it? How long have they been trading?">
                        Business Description
                      </FieldLabel>
                      <textarea
                        required
                        value={form.description}
                        onChange={set("description")}
                        placeholder="e.g. Family-run plumbing company in Birmingham, 12 years trading. Gary and his son Tom. Main services: emergency callouts, boiler installs (Worcester Bosch certified), bathroom fitting..."
                        rows={3}
                        className="input resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <FieldLabel hint="What services/products should we prioritise in campaigns?">
                        Key Services to Prioritise
                      </FieldLabel>
                      <textarea
                        value={form.keyServices}
                        onChange={set("keyServices")}
                        placeholder="e.g. 1. Emergency callouts (highest urgency, converts fast). 2. Boiler installation (highest margin). 3. Bathroom fitting..."
                        rows={2}
                        className="input resize-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <FieldLabel hint="For local SEO — specific areas, postcodes, or radius">
                        Service Area / Location
                      </FieldLabel>
                      <input
                        value={form.serviceArea}
                        onChange={set("serviceArea")}
                        placeholder="e.g. South Birmingham — Edgbaston, Moseley, Harborne. ~8 miles from B15."
                        className="input"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <FieldLabel hint="Optional — contact email for the client">Contact Email</FieldLabel>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={set("contactEmail")}
                        placeholder="info@example.co.uk"
                        className="input"
                      />
                    </div>
                    <div className="col-span-2">
                      <FieldLabel hint="Website, Google Business Profile, social accounts, Shopify, press mentions...">
                        Existing Digital Assets
                      </FieldLabel>
                      <textarea
                        value={form.existingAssets}
                        onChange={set("existingAssets")}
                        placeholder="e.g. WordPress site (slow), GBP claimed (47 reviews, 4.6★), Facebook page (250 followers, inactive), no Instagram..."
                        rows={2}
                        className="input resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <FieldLabel hint="Businesses they compete with — for gap analysis">Known Competitors</FieldLabel>
                      <input
                        value={form.competitors}
                        onChange={set("competitors")}
                        placeholder="e.g. Birmingham Boiler Company, local Checkatrade listings..."
                        className="input"
                      />
                    </div>
                  </div>
                </section>

                {/* ── SECTION 2: Goals & Budget ── */}
                <section>
                  <SectionHeader
                    number="2"
                    icon={<Target className="w-4 h-4" />}
                    title="Goals &amp; Budget"
                    subtitle="What success looks like and what we're working with"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <FieldLabel required>Package</FieldLabel>
                      <select
                        value={form.package}
                        onChange={set("package")}
                        className="input"
                      >
                        <option value="seo">SEO Only</option>
                        <option value="seo-ads">SEO + Google Ads</option>
                        <option value="ads">Google Ads Only</option>
                        <option value="content">Content Only</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <FieldLabel
                        required
                        hint="In the client's own words — what do they actually want to achieve? More calls? Online sales? Brand visibility?"
                      >
                        Business Goals
                      </FieldLabel>
                      <textarea
                        required
                        value={form.businessGoals}
                        onChange={set("businessGoals")}
                        placeholder="e.g. More phone enquiries — especially boiler installs (highest margin). Gary said: 'If I get 5 more boiler installs a month, I'd be happy.' Also wants to stop slow months in Jan/Feb."
                        rows={2}
                        className="input resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <FieldLabel hint="Who is the ideal customer? Age, location, trigger for buying?">
                        Target Audience / Ideal Customer
                      </FieldLabel>
                      <textarea
                        value={form.targetAudience}
                        onChange={set("targetAudience")}
                        placeholder="e.g. Homeowners in South Birmingham, 35–65. Two types: reactive (emergency, needs someone TODAY) and planned (bathroom reno, new boiler before winter)..."
                        rows={2}
                        className="input resize-none"
                      />
                    </div>

                    {/* Budget fields */}
                    <div>
                      <FieldLabel hint="Monthly Scramble retainer for SEO work">
                        <span className="flex items-center gap-1">
                          <PoundSterling className="w-3 h-3" />
                          SEO Retainer (£/month)
                        </span>
                      </FieldLabel>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={form.seoRetainerFee}
                        onChange={set("seoRetainerFee")}
                        placeholder="e.g. 750"
                        className="input"
                      />
                    </div>

                    {needsAds && (
                      <div>
                        <FieldLabel hint="Monthly spend budget for Google Ads — goes to Google, not Scramble">
                          <span className="flex items-center gap-1">
                            <PoundSterling className="w-3 h-3" />
                            Ads Spend Budget (£/month)
                          </span>
                        </FieldLabel>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={form.adsBudget}
                          onChange={set("adsBudget")}
                          placeholder="e.g. 500"
                          className="input"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* ── SECTION 3: Notes for Cayde ── */}
                <section>
                  <SectionHeader
                    number="3"
                    icon={<ChevronRight className="w-4 h-4" />}
                    title="Notes for Cayde"
                    subtitle="Anything else the agent needs to know to run this account well"
                  />
                  <textarea
                    value={form.additionalNotes}
                    onChange={set("additionalNotes")}
                    placeholder="e.g. Gary is sceptical of SEO — wants to see results in 3 months. Focus on emergency keywords first because they convert fastest. Tom (son) is the technical contact. Don't use jargon with Gary..."
                    rows={3}
                    className="input resize-none"
                  />
                </section>

                {/* ── SECTION 4: Technical Access (collapsible) ── */}
                <section>
                  <button
                    type="button"
                    onClick={() => setShowTechnical(!showTechnical)}
                    className="flex items-center gap-2 w-full"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--color-bg-border)", color: "var(--color-text-muted)" }}
                      >
                        4
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Plug className="w-4 h-4 text-text-dim" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-text">Technical Access</p>
                          <p className="text-xs text-text-muted">
                            Google integrations — can be added now or later on the client page
                          </p>
                        </div>
                      </div>
                    </div>
                    {showTechnical ? (
                      <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                  </button>

                  {showTechnical && (
                    <div className="mt-4 grid grid-cols-1 gap-3 pl-11">
                      <div>
                        <FieldLabel hint="e.g. sc-domain:example.co.uk  or  https://example.co.uk">
                          Search Console Site URL
                        </FieldLabel>
                        <input
                          value={form.siteUrl}
                          onChange={set("siteUrl")}
                          placeholder="sc-domain:example.co.uk"
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <FieldLabel hint="From Google Analytics admin — format: properties/123456789">
                          GA4 Property ID
                        </FieldLabel>
                        <input
                          value={form.analyticsPropertyId}
                          onChange={set("analyticsPropertyId")}
                          placeholder="properties/123456789"
                          className="input text-sm"
                        />
                      </div>
                      {needsAds && (
                        <div>
                          <FieldLabel hint="From Google Ads — format: 123-456-7890">
                            Google Ads Customer ID
                          </FieldLabel>
                          <input
                            value={form.adsCustomerId}
                            onChange={set("adsCustomerId")}
                            placeholder="123-456-7890"
                            className="input text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* ── Submit bar (sticky) ── */}
              <div
                className="px-6 py-4 flex-shrink-0 flex gap-3"
                style={{ borderTop: "1px solid var(--color-bg-border)", background: "var(--color-bg-card)" }}
              >
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Creating…"
                  ) : (
                    <>
                      Add Client &amp; Start Onboarding
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
