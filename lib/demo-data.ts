/**
 * Realistic sample data used when Google API connections aren't set up yet.
 * Labelled clearly as "Sample Data" in the UI.
 *
 * These numbers represent what a typical small UK service business
 * achieves after 2–3 months of focused local SEO.
 */

export const DEMO_SEARCH_CONSOLE = {
  "client-001": {
    summary: {
      totalClicks: 347,
      totalImpressions: 12847,
      avgCtr: 2.7,
      avgPosition: 18.4,
    },
    topKeywords: [
      { query: "birmingham plumber", clicks: 84, impressions: 1240, ctr: 6.8, position: 4.2 },
      { query: "emergency plumber birmingham", clicks: 62, impressions: 890, ctr: 7.0, position: 5.1 },
      { query: "boiler repair birmingham", clicks: 48, impressions: 710, ctr: 6.8, position: 6.8 },
      { query: "plumber near me birmingham", clicks: 41, impressions: 1100, ctr: 3.7, position: 9.3 },
      { query: "drain unblocking birmingham", clicks: 29, impressions: 540, ctr: 5.4, position: 8.2 },
      { query: "bathroom fitting birmingham", clicks: 24, impressions: 620, ctr: 3.9, position: 11.7 },
      { query: "gas safe engineer birmingham", clicks: 19, impressions: 380, ctr: 5.0, position: 12.4 },
      { query: "central heating birmingham", clicks: 15, impressions: 490, ctr: 3.1, position: 15.2 },
      { query: "blocked drain birmingham", clicks: 12, impressions: 320, ctr: 3.8, position: 14.1 },
      { query: "plumbing services birmingham", clicks: 13, impressions: 557, ctr: 2.3, position: 19.8 },
    ],
    trend: { direction: "up", percent: 23 },
  },
  "client-002": {
    summary: {
      totalClicks: 892,
      totalImpressions: 31204,
      avgCtr: 2.9,
      avgPosition: 12.7,
    },
    topKeywords: [
      { query: "interior designer london", clicks: 143, impressions: 2840, ctr: 5.0, position: 7.2 },
      { query: "home interior design uk", clicks: 118, impressions: 2200, ctr: 5.4, position: 8.8 },
      { query: "living room design ideas", clicks: 97, impressions: 3100, ctr: 3.1, position: 11.4 },
      { query: "interior design consultation london", clicks: 84, impressions: 920, ctr: 9.1, position: 5.3 },
      { query: "bedroom interior designer", clicks: 73, impressions: 1780, ctr: 4.1, position: 9.7 },
      { query: "kitchen designer london", clicks: 61, impressions: 1340, ctr: 4.6, position: 10.2 },
      { query: "open plan living design", clicks: 54, impressions: 2100, ctr: 2.6, position: 14.8 },
      { query: "luxury interior design uk", clicks: 48, impressions: 1560, ctr: 3.1, position: 13.3 },
      { query: "home renovation ideas uk", clicks: 42, impressions: 2940, ctr: 1.4, position: 18.7 },
      { query: "bespoke interior design", clicks: 39, impressions: 870, ctr: 4.5, position: 11.1 },
    ],
    trend: { direction: "up", percent: 31 },
  },
};

export const DEMO_ANALYTICS = {
  "client-001": {
    sessions: 412,
    users: 347,
    bounceRate: 58.2,
    avgSessionDuration: "1m 47s",
    trend: { sessions: 19, users: 23 },
    topPages: [
      { page: "/", sessions: 148, bounceRate: 62 },
      { page: "/services/boiler-repair", sessions: 87, bounceRate: 44 },
      { page: "/services/emergency-plumber", sessions: 72, bounceRate: 38 },
      { page: "/contact", sessions: 54, bounceRate: 22 },
      { page: "/services/bathroom-installation", sessions: 51, bounceRate: 51 },
    ],
  },
  "client-002": {
    sessions: 1047,
    users: 892,
    bounceRate: 48.7,
    avgSessionDuration: "2m 34s",
    trend: { sessions: 28, users: 31 },
    topPages: [
      { page: "/", sessions: 312, bounceRate: 54 },
      { page: "/portfolio", sessions: 198, bounceRate: 41 },
      { page: "/services/full-room-design", sessions: 167, bounceRate: 32 },
      { page: "/about", sessions: 143, bounceRate: 58 },
      { page: "/contact", sessions: 97, bounceRate: 18 },
    ],
  },
};

export const DEMO_ADS = {
  "client-002": {
    spend: 847,
    clicks: 312,
    impressions: 8940,
    ctr: 3.5,
    conversions: 14,
    costPerConversion: 60.5,
    roas: 3.2,
    campaigns: [
      {
        name: "Full Room Design — Search",
        status: "active",
        spend: 612,
        clicks: 224,
        conversions: 10,
        roas: 3.8,
      },
      {
        name: "Home Renovation — Display",
        status: "active",
        spend: 235,
        clicks: 88,
        conversions: 4,
        roas: 2.1,
      },
    ],
  },
};

export const DASHBOARD_DEMO_TOTALS = {
  totalClients: 2,
  activeClients: 2,
  totalOrganicClicks: 1239,
  totalImpressions: 44051,
  avgPosition: 14.8,
  keywordsTracked: 110,
  keywordsTop10: 27,
};

export interface DemoSCData {
  summary: { totalClicks: number; totalImpressions: number; avgCtr: number; avgPosition: number };
  topKeywords: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  trend: { direction: string; percent: number };
}

export interface DemoAnalyticsData {
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: string;
  trend: { sessions: number; users: number };
  topPages: { page: string; sessions: number; bounceRate: number }[];
}

export interface DemoAdsData {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
  roas: number;
  campaigns: { name: string; status: string; spend: number; clicks: number; conversions: number; roas: number }[];
}
