/**
 * GET /api/health
 * Checks the health of all configured Maton API connections.
 *
 * The agent should call this on startup and daily to confirm all Google
 * service connections are active. A failing connection means the corresponding
 * client data routes will not work.
 *
 * Each service returns:
 *   status: "ok" | "error" | "unchecked"
 *   latencyMs: number (only if checked)
 *   error: { code, message, retryable } (only on error)
 *
 * Note: Only Search Console and Analytics Admin are actively probed (fast calls).
 * Other services are reported as "unchecked" to avoid rate-limit issues.
 */
import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { classifyMatonError } from "@/lib/api-response";

interface ServiceResult {
  service: string;
  connectionId: string;
  status: "ok" | "error" | "unchecked";
  latencyMs?: number;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

const CONNECTIONS: {
  service: string;
  connectionId: string;
  probeEndpoint: string | null;
}[] = [
  {
    service: "Google Search Console",
    connectionId: "e0545516-ba56-490c-a398-68f738e46987",
    probeEndpoint: "/google-search-console/webmasters/v3/sites",
  },
  {
    service: "Google Analytics Admin",
    connectionId: "410a223a-23b0-4d7e-b6f7-ccb63e53882d",
    probeEndpoint: "/google-analytics-admin/v1beta/accountSummaries",
  },
  {
    service: "Google Analytics Data",
    connectionId: "97508d12-ad42-44ec-94ff-e00e9d329ef4",
    probeEndpoint: null, // tested implicitly when running reports
  },
  {
    service: "Google Ads",
    connectionId: "5fc30d82-81e2-404d-87d0-603392590300",
    probeEndpoint: null, // tested when fetching campaign data
  },
  {
    service: "Google Sheets",
    connectionId: "f0113f6d-da60-40ab-9cc5-1be352e77ae6",
    probeEndpoint: null,
  },
  {
    service: "Google Drive",
    connectionId: "0248269d-78bd-4909-93ed-2f37efb11e86",
    probeEndpoint: null,
  },
  {
    service: "Google Docs",
    connectionId: "ec784bc5-7362-45f5-9666-31638a0ae087",
    probeEndpoint: null,
  },
  {
    service: "Google Mail",
    connectionId: "c680583d-f679-4a7d-8a90-64a70c615061",
    probeEndpoint: null,
  },
  {
    service: "Google Calendar",
    connectionId: "0c3188c3-95c9-4113-919c-dc382fde3f00",
    probeEndpoint: null,
  },
];

function probe(endpoint: string): ServiceResult["status"] | { error: ServiceResult["error"]; latencyMs: number } {
  const start = Date.now();
  try {
    execSync(`maton api '${endpoint}'`, {
      encoding: "utf-8",
      timeout: 12_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { error: undefined, latencyMs: Date.now() - start } as { error: undefined; latencyMs: number };
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { stderr?: Buffer | string };
    const raw = (e.stderr?.toString() ?? e.message ?? "Unknown error").trim();
    const { code, retryable } = classifyMatonError(raw);
    return {
      error: { code, message: raw.slice(0, 200), retryable },
      latencyMs: Date.now() - start,
    };
  }
}

export async function GET() {
  const results: ServiceResult[] = CONNECTIONS.map(({ service, connectionId, probeEndpoint }) => {
    if (!probeEndpoint) {
      return { service, connectionId, status: "unchecked" as const };
    }

    const result = probe(probeEndpoint);
    if (typeof result === "string") {
      return { service, connectionId, status: result as ServiceResult["status"] };
    }

    if (result.error) {
      return {
        service,
        connectionId,
        status: "error" as const,
        latencyMs: result.latencyMs,
        error: result.error,
      };
    }

    return {
      service,
      connectionId,
      status: "ok" as const,
      latencyMs: result.latencyMs,
    };
  });

  const checked = results.filter((r) => r.status !== "unchecked");
  const errors = checked.filter((r) => r.status === "error");
  const overall = errors.length === 0
    ? checked.length > 0 ? "ok" : "unchecked"
    : errors.length === checked.length ? "error" : "degraded";

  return NextResponse.json({
    ok: true,
    data: {
      overall,
      checkedAt: new Date().toISOString(),
      summary: {
        checked: checked.length,
        ok: checked.filter((r) => r.status === "ok").length,
        errors: errors.length,
        unchecked: results.filter((r) => r.status === "unchecked").length,
      },
      services: results,
    },
  });
}
