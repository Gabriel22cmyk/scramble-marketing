# Scramble Dashboard — API Reference

> **For the agent (Cayde).** This is the complete reference for all routes the agent
> can call autonomously. Every route returns a consistent JSON envelope.
> 
> **Response shape:**
> ```
> Success → { ok: true, data: <T>, meta: { generatedAt, ... } }
> Error   → { ok: false, error: { code, message, retryable } }
> ```
> **Error codes:** `BAD_REQUEST` | `NOT_FOUND` | `MATON_UNAVAILABLE` | `MATON_AUTH_ERROR`
> | `MATON_RATE_LIMIT` | `GOOGLE_API_ERROR` | `CLIENT_NOT_CONFIGURED` | `INTERNAL_ERROR` | `TIMEOUT`
>
> **Retry logic:** Check `error.retryable`. If `true`, back off and retry.
> If `false`, escalate or skip.

---

## Agent Autonomous Workflow

```
Daily (08:00 UTC):
  GET /api/agent/dashboard          → get work queue + all alerts
  GET /api/health                   → check all connections

Per active client (from work queue):
  GET /api/clients/{id}             → full client state
  GET /api/clients/{id}/weekly-summary → this week's activity + narrative

When SC connected:
  GET /api/search-console/analytics?siteUrl=...&startDate=...&endDate=...

When Analytics connected:
  GET /api/analytics/report?propertyId=...

When Ads connected (Ads package clients):
  GET /api/ads/campaigns?customerId=...

Weekly (Sunday 23:00 UTC):
  GET /api/clients/{id}/weekly-summary    → for each client
  POST /api/clients/{id}/notes            → log weekly summary action
```

---

## Agent Routes

### `GET /api/agent/dashboard`
**The agent's daily check-in.** Returns all active clients sorted by urgency,
all open alerts, portfolio health, and a plain-English briefing.

```json
{
  "ok": true,
  "data": {
    "generatedAt": "...",
    "portfolio": { "total": 2, "active": 2, "onboarding": 0, "paused": 0 },
    "health": { "allGreen": false, "criticalAlerts": 4, "clientsWithIssues": 2 },
    "workQueue": [
      {
        "clientId": "client-001",
        "clientName": "Mitchell Plumbing",
        "urgencyScore": 23,
        "alerts": { "total": 3, "critical": 2, "warning": 1 },
        "integrations": { "searchConsole": false, "analytics": false },
        "weeklySummaryUrl": "http://.../api/clients/client-001/weekly-summary"
      }
    ],
    "allAlerts": [ ... ],
    "agentBriefing": "4 critical alerts require immediate attention..."
  }
}
```
**Cache:** 5 minutes. **Poll:** Once per day.

---

## Client Routes

### `GET /api/clients`
List all clients with full data (brief, strategy, checklist, notes).

### `POST /api/clients`
Create a new client. Required: `name`, `domain`, `package`.
Optional: `businessBrief`, `siteUrl`, `analyticsPropertyId`, `adsCustomerId`.

### `GET /api/clients/{id}`
Get single client by ID. Returns full `Client` object.

### `PATCH /api/clients/{id}`
Update any top-level client fields. Body: partial `Client`.

### `DELETE /api/clients/{id}`
Remove a client permanently.

### `GET /api/clients/{id}/brief`
Get the business brief for a client.

### `PATCH /api/clients/{id}/brief`
Update business brief fields. Body: partial `BusinessBrief`.
Auto-marks `setupChecklist.briefReceived` when `description` + `businessGoals` are set.

### `GET /api/clients/{id}/strategy`
Get the campaign strategy document.

### `PATCH /api/clients/{id}/strategy`
Update campaign strategy. Auto-marks `setupChecklist.strategyDocumented` when `summary` is set.

### `GET /api/clients/{id}/notes`
Get the activity log for a client (all entries, newest first).

### `POST /api/clients/{id}/notes`
Add an activity log entry.
```json
{ "content": "Adjusted bids on boiler repair campaign — CPA was £85, target is £60.", "type": "action", "author": "cayde" }
```
**Types:** `action` | `note` | `alert` | `system` | `report`
**Authors:** `cayde` | `gabriel`

### `GET /api/clients/{id}/checklist`
Get the setup checklist.

### `PATCH /api/clients/{id}/checklist`
Update checklist items. Body: partial `SetupChecklist`.
```json
{ "searchConsoleVerified": true, "keywordsAdded": true }
```

### `GET /api/clients/{id}/weekly-summary`
**The weekly report source.** Returns the past 7 days of activity,
open alerts, campaign context, and metric fetch URLs.

```json
{
  "ok": true,
  "data": {
    "period": { "label": "21–27 Aug 2026" },
    "activity": { "total": 3, "entries": [...] },
    "alerts": { "total": 2, "critical": 1 },
    "campaign": { "nextActions": "1. Fix page speed\n2. ..." },
    "metrics": {
      "searchConsole": { "connected": false, "fetchUrl": null },
      "analytics": { "connected": false, "fetchUrl": null }
    },
    "suggestedNarrative": {
      "whatWeDid": ["Completed keyword research...", "Ran site audit..."],
      "openItems": ["Search Console not connected"],
      "nextWeekFocus": "Fix page speed — targeting 70+ on mobile"
    }
  }
}
```
**Cache:** 1 hour.

---

## Google API Routes

### `GET /api/search-console/sites`
List all verified Search Console properties.
**Cache:** 4 hours. **Maton connection:** e0545516

### `GET /api/search-console/analytics`
Run a Search Console analytics query.

| Param | Required | Default | Notes |
|---|---|---|---|
| `siteUrl` | ✓ | — | sc-domain: or https:// |
| `startDate` | — | 30 days ago | YYYY-MM-DD |
| `endDate` | — | today | YYYY-MM-DD |
| `dimensions` | — | `query` | comma-separated |
| `rowLimit` | — | 25 | max 25000 |

**Cache:** 4 hours. **Poll max:** once per 4h per site.

### `GET /api/analytics/properties`
List all GA4 accounts and properties.
**Cache:** 1 hour. **Maton connection:** 410a223a

### `GET /api/analytics/report`
Run a 30-day GA4 report (sessions, users, bounce rate, avg session duration).

| Param | Required | Notes |
|---|---|---|
| `propertyId` | ✓ | properties/123456789 |

**Cache:** 1 hour. **Poll max:** once per hour.

### `GET /api/ads/accounts`
List Google Ads accounts.
**Cache:** 30 min. **Maton connection:** 5fc30d82

### `GET /api/ads/campaigns`
Get campaign list + performance for a customer.

| Param | Required | Default | Notes |
|---|---|---|---|
| `customerId` | ✓ | — | 123-456-7890 |
| `dateRange` | — | `LAST_30_DAYS` | LAST_7_DAYS / LAST_30_DAYS / THIS_MONTH |

Returns `{ campaigns, performance, meta: { partial, errors } }`.
Partial results returned if one sub-call fails.
**Cache:** 30 min. **Poll max:** once per 30 min.

### `GET /api/health`
Check all 9 Maton connection statuses. Actively probes SC + Analytics Admin.
Others reported as `unchecked` (prevents rate-limit issues).

```json
{
  "data": {
    "overall": "ok | degraded | error",
    "summary": { "checked": 2, "ok": 2, "errors": 0, "unchecked": 7 },
    "services": [
      { "service": "Google Search Console", "status": "ok", "latencyMs": 340 },
      { "service": "Google Ads", "status": "unchecked" }
    ]
  }
}
```

---

## Connection IDs (Maton — labseme21@icloud.com)

| Service | Connection ID |
|---|---|
| Google Search Console | e0545516-ba56-490c-a398-68f738e46987 |
| Google Analytics Admin | 410a223a-23b0-4d7e-b6f7-ccb63e53882d |
| Google Analytics Data | 97508d12-ad42-44ec-94ff-e00e9d329ef4 |
| Google Ads | 5fc30d82-81e2-404d-87d0-603392590300 |
| Google Sheets | f0113f6d-da60-40ab-9cc5-1be352e77ae6 |
| Google Drive | 0248269d-78bd-4909-93ed-2f37efb11e86 |
| Google Docs | ec784bc5-7362-45f5-9666-31638a0ae087 |
| Google Mail | c680583d-f679-4a7d-8a90-64a70c615061 |
| Google Calendar | 0c3188c3-95c9-4113-919c-dc382fde3f00 |

---

## Error Handling Reference

| Code | HTTP | Retryable | Agent action |
|---|---|---|---|
| `BAD_REQUEST` | 400 | No | Fix the request params — do not retry |
| `NOT_FOUND` | 404 | No | Resource doesn't exist — check client ID |
| `MATON_AUTH_ERROR` | 500 | No | Re-auth needed — alert Gabriel |
| `MATON_RATE_LIMIT` | 503 | Yes | Back off 60s minimum, then retry |
| `MATON_UNAVAILABLE` | 503 | Yes | Maton CLI not found — system issue |
| `GOOGLE_API_ERROR` | 502 | Yes | Upstream error — retry after 30s |
| `TIMEOUT` | 503 | Yes | Request timed out — retry once |
| `INTERNAL_ERROR` | 500 | No | Bug — log and skip |
