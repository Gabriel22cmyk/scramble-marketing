export type ClientStatus = "active" | "paused" | "churned" | "onboarding";
export type ClientPackage = "seo" | "seo-ads" | "ads" | "content";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType =
  | "no-search-console"
  | "no-analytics"
  | "no-ads"
  | "no-report-scheduled"
  | "no-keywords"
  | "no-audit"
  | "no-brief"
  | "ranking-drop"
  | "traffic-drop"
  | "client-new";
export type NoteType = "action" | "note" | "alert" | "system" | "report";

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS BRIEF
// Filled in by Gabriel after talking to the client.
// This is the "human handoff" — everything the agent needs to actually
// build and run the campaign strategy.
// ─────────────────────────────────────────────────────────────────────────────
export interface BusinessBrief {
  /** What the business does — in Gabriel's own plain words */
  description: string;
  /** Who their ideal customer is */
  targetAudience: string;
  /** What success looks like for this client ("more phone calls", "online sales") */
  businessGoals: string;
  /** Geographic targeting — "South Birmingham, 8 mile radius from B15" */
  serviceArea: string;
  /** Which services/products to prioritise in campaigns */
  keyServices: string;
  /** Known competitors to track and gap-analyse */
  competitors: string;
  /** Existing digital assets — website, GBP, social accounts, Shopify etc. */
  existingAssets: string;
  /** Monthly SEO retainer (GBP) */
  seoRetainerFee: number | null;
  /** Monthly Google Ads spend budget (GBP) — separate from Scramble's management fee */
  adsBudget: number | null;
  /** Free-text catch-all — anything else Gabriel wants to tell Cayde */
  additionalNotes: string;
  updatedAt?: string;
  updatedBy?: "gabriel" | "cayde";
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN STRATEGY
// Filled in by the agent (Cayde) — the working strategy document.
// Updated whenever the agent makes significant changes.
// ─────────────────────────────────────────────────────────────────────────────
export interface CampaignStrategy {
  /** Plain-English summary of what we're doing and why */
  summary: string;
  /** Target keyword list with notes — one per line or structured text */
  targetKeywords: string;
  /** For Ads clients: campaign names, ad groups, budget allocation */
  adCampaignStructure: string;
  /** Next planned actions — what Cayde intends to do in the next 7 days */
  nextActions: string;
  updatedAt?: string;
  updatedBy?: "cayde" | "gabriel";
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────
export interface SetupChecklist {
  clientInfoComplete: boolean;
  briefReceived: boolean;
  searchConsoleVerified: boolean;
  analyticsLinked: boolean;
  adsLinked: boolean;
  keywordsAdded: boolean;
  initialAuditDone: boolean;
  strategyDocumented: boolean;
  reportScheduled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY NOTE
// ─────────────────────────────────────────────────────────────────────────────
export interface ClientNote {
  id: string;
  type: NoteType;
  content: string;
  author: "cayde" | "gabriel";
  timestamp: string;
}

export interface ClientAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  action?: string;
  actionHref?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  domain: string;
  package: ClientPackage;
  status: ClientStatus;
  startDate: string;
  contactEmail?: string;
  tags?: string[];
  // Google integrations
  siteUrl: string | null;
  analyticsPropertyId: string | null;
  adsCustomerId: string | null;
  // The brief Gabriel fills in
  businessBrief: BusinessBrief;
  // The strategy Cayde documents
  campaignStrategy: CampaignStrategy;
  // Setup progress checklist
  setupChecklist: SetupChecklist;
  // Activity log / audit trail
  notes: ClientNote[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API / GOOGLE TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

export interface GAPropertySummary {
  account: string;
  displayName: string;
  propertySummaries?: {
    property: string;
    displayName: string;
    propertyType?: string;
  }[];
}

export interface GAReport {
  rows?: {
    dimensionValues: { value: string }[];
    metricValues: { value: string }[];
  }[];
  totals?: {
    metricValues: { value: string }[];
  }[];
  rowCount?: number;
}

export interface HealthStatus {
  service: string;
  connectionId: string;
  status: "ok" | "error" | "unknown";
  message?: string;
  latencyMs?: number;
}
