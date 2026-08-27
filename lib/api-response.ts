/**
 * Consistent API response utilities.
 *
 * All routes consumed by autonomous agent processes use these helpers
 * to guarantee predictable JSON shapes the agent can parse reliably —
 * no guessing whether the error is in `error`, `message`, or `detail`.
 *
 * Shape contract:
 *   Success → { ok: true, data: T, meta?: { ... } }
 *   Error   → { ok: false, error: { code: string, message: string, details?: unknown } }
 *
 * HTTP status codes:
 *   200 – success
 *   400 – bad request (missing/invalid input)
 *   404 – resource not found
 *   500 – server / upstream error
 *   503 – upstream service unavailable (Maton/Google API down)
 */

import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    generatedAt?: string;
    cacheMaxAge?: number;
    source?: "live" | "cached" | "demo";
    [key: string]: unknown;
  };
}

export interface ApiError {
  ok: false;
  error: {
    /** Machine-readable error code for agent decision logic */
    code: ErrorCode;
    /** Human-readable message */
    message: string;
    /** Optional structured details */
    details?: unknown;
    /** Whether the agent should retry this request */
    retryable: boolean;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export type ErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "MATON_UNAVAILABLE"
  | "MATON_AUTH_ERROR"
  | "MATON_RATE_LIMIT"
  | "GOOGLE_API_ERROR"
  | "CLIENT_NOT_CONFIGURED"
  | "INTERNAL_ERROR"
  | "TIMEOUT";

// ─────────────────────────────────────────────────────────────────────────────
// Builders
// ─────────────────────────────────────────────────────────────────────────────

export function apiOk<T>(
  data: T,
  meta?: ApiSuccess<T>["meta"]
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { ok: true, data, ...(meta ? { meta: { generatedAt: new Date().toISOString(), ...meta } } : { meta: { generatedAt: new Date().toISOString() } }) },
    { status: 200 }
  );
}

export function apiError(
  code: ErrorCode,
  message: string,
  httpStatus = 500,
  opts: { details?: unknown; retryable?: boolean } = {}
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details: opts.details,
        retryable: opts.retryable ?? isRetryable(code),
      },
    },
    { status: httpStatus }
  );
}

function isRetryable(code: ErrorCode): boolean {
  return ["MATON_RATE_LIMIT", "MATON_UNAVAILABLE", "TIMEOUT", "GOOGLE_API_ERROR"].includes(code);
}

// ─────────────────────────────────────────────────────────────────────────────
// Error classifiers (for parsing raw exec errors into structured codes)
// ─────────────────────────────────────────────────────────────────────────────

export function classifyMatonError(rawMessage: string): { code: ErrorCode; retryable: boolean } {
  const msg = rawMessage.toLowerCase();
  if (msg.includes("etimedout") || msg.includes("timeout")) {
    return { code: "TIMEOUT", retryable: true };
  }
  if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("auth")) {
    return { code: "MATON_AUTH_ERROR", retryable: false };
  }
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
    return { code: "MATON_RATE_LIMIT", retryable: true };
  }
  if (msg.includes("enoent") || msg.includes("command not found") || msg.includes("maton:")) {
    return { code: "MATON_UNAVAILABLE", retryable: true };
  }
  if (msg.includes("404") || msg.includes("not found")) {
    return { code: "NOT_FOUND", retryable: false };
  }
  return { code: "GOOGLE_API_ERROR", retryable: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache-control helper (for cron-friendly responses)
// ─────────────────────────────────────────────────────────────────────────────

/** Attach Cache-Control so the agent knows when data expires without re-fetching */
export function withCache<T>(
  response: NextResponse<T>,
  maxAgeSeconds: number
): NextResponse<T> {
  response.headers.set(
    "Cache-Control",
    `private, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`
  );
  return response;
}

// Recommended cache TTLs for agent processes
export const CACHE_TTL = {
  SEARCH_CONSOLE: 60 * 60 * 4, // 4 hours — SC data updates ~daily
  ANALYTICS: 60 * 60, // 1 hour
  ADS: 60 * 30, // 30 minutes — ad data more volatile
  CLIENTS: 60 * 5, // 5 minutes
  WEEKLY_SUMMARY: 60 * 60, // 1 hour
} as const;
