/**
 * Maton CLI wrapper.
 *
 * Designed to be called by both Next.js API routes (human-initiated)
 * and autonomous agent cron processes. Key guarantees:
 *
 * - Never throws generic errors — always throws MatonError with structured info
 * - Classifies error types (auth, rate-limit, timeout, not-found) so the
 *   caller can decide whether to retry, alert, or skip
 * - Respects timeouts — prevents cron processes from hanging indefinitely
 * - Parses stdout as JSON; if not JSON, returns the raw string
 */

import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";
import { classifyMatonError } from "./api-response";

// ─────────────────────────────────────────────────────────────────────────────
// Error class
// ─────────────────────────────────────────────────────────────────────────────

export class MatonError extends Error {
  constructor(
    public readonly command: string,
    public readonly code: string,
    public readonly retryable: boolean,
    public readonly stderr: string,
    message: string
  ) {
    super(message);
    this.name = "MatonError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core executor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute a maton CLI command and return parsed JSON output.
 *
 * @param args - Arguments passed to `maton` (everything after the binary name)
 * @param timeoutMs - Max wait time in milliseconds (default: 30s)
 */
export function matonExec(args: string, timeoutMs = 30_000): unknown {
  const cmd = `maton ${args}`;
  const opts: ExecSyncOptionsWithStringEncoding = {
    encoding: "utf-8",
    timeout: timeoutMs,
    env: { ...process.env },
    // Capture stderr separately so we can include it in the error
    stdio: ["pipe", "pipe", "pipe"],
  };

  let stdout = "";
  let stderr = "";

  try {
    stdout = execSync(cmd, opts) as string;
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: Buffer | string;
      stderr?: Buffer | string;
      status?: number;
    };

    stderr = (e.stderr?.toString() ?? e.message ?? "").trim();
    const out = (e.stdout?.toString() ?? "").trim();
    const raw = stderr || out || e.message || "Unknown error";
    const { code, retryable } = classifyMatonError(raw);

    throw new MatonError(
      cmd,
      code,
      retryable,
      stderr,
      `Maton command failed [${code}]: ${raw.slice(0, 300)}`
    );
  }

  const trimmed = stdout.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Not JSON — return raw string (some maton commands output plain text)
    return trimmed;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API gateway helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Call a Maton-proxied API endpoint.
 *
 * @param path - API path (e.g. '/google-search-console/webmasters/v3/sites')
 * @param options - method, body data, timeout
 */
export function matonApi(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    data?: unknown;
    timeoutMs?: number;
  }
): unknown {
  let cmd = `api '${path}'`;

  if (options?.method && options.method !== "GET") {
    cmd += ` -X ${options.method}`;
  }

  if (options?.data) {
    // Escape single quotes in JSON for shell safety
    const json = JSON.stringify(options.data).replace(/'/g, `'\\''`);
    cmd += ` -d '${json}'`;
  }

  return matonExec(cmd, options?.timeoutMs ?? 30_000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Search Console
// ─────────────────────────────────────────────────────────────────────────────

export const searchConsole = {
  /**
   * List all verified sites in Search Console.
   * Agent polling interval: max once per hour.
   */
  listSites: () =>
    matonApi("/google-search-console/webmasters/v3/sites", { timeoutMs: 15_000 }),

  /**
   * Run a Search Analytics query for a given site.
   * Agent polling interval: max once per 4 hours.
   */
  queryAnalytics: (
    siteUrl: string,
    params: {
      startDate: string;
      endDate: string;
      dimensions?: string[];
      rowLimit?: number;
    }
  ) => {
    const encodedUrl = encodeURIComponent(siteUrl);
    return matonApi(
      `/google-search-console/webmasters/v3/sites/${encodedUrl}/searchAnalytics/query`,
      {
        method: "POST",
        data: {
          startDate: params.startDate,
          endDate: params.endDate,
          dimensions: params.dimensions ?? ["query"],
          rowLimit: params.rowLimit ?? 25,
        },
        timeoutMs: 25_000,
      }
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Google Analytics
// ─────────────────────────────────────────────────────────────────────────────

export const analytics = {
  /**
   * List GA4 account summaries and their properties.
   */
  listProperties: () =>
    matonApi("/google-analytics-admin/v1beta/accountSummaries", { timeoutMs: 15_000 }),

  /**
   * Run a standard 30-day report for a GA4 property.
   * Fetches sessions, users, bounce rate, avg session duration.
   */
  runReport: (propertyId: string) => {
    const cleanId = propertyId.replace(/^properties\//, "");
    return matonApi(
      `/google-analytics-data/v1beta/properties/${cleanId}:runReport`,
      {
        method: "POST",
        data: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
          ],
          dimensions: [{ name: "date" }],
        },
        timeoutMs: 25_000,
      }
    );
  },

  /**
   * Run a weekly comparison report (this week vs last week).
   * Useful for automated weekly summaries.
   */
  runWeeklyComparison: (propertyId: string) => {
    const cleanId = propertyId.replace(/^properties\//, "");
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    return matonApi(
      `/google-analytics-data/v1beta/properties/${cleanId}:runReport`,
      {
        method: "POST",
        data: {
          dateRanges: [
            { startDate: fmt(weekStart), endDate: fmt(today), name: "this_week" },
            { startDate: fmt(prevWeekStart), endDate: fmt(weekStart), name: "last_week" },
          ],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "conversions" },
          ],
        },
        timeoutMs: 25_000,
      }
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Google Ads
// ─────────────────────────────────────────────────────────────────────────────

export const googleAds = {
  listAccounts: () => matonExec("google-ads account list", 15_000),

  listCampaigns: (customerId: string) =>
    matonExec(`google-ads campaign list -c ${customerId}`, 20_000),

  campaignPerformance: (customerId: string, dateRange = "LAST_7_DAYS") =>
    matonExec(
      `google-ads campaign performance -c ${customerId} --date-range ${dateRange}`,
      25_000
    ),
};
