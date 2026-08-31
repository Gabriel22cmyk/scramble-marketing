# Google OAuth Setup for Scramble Dashboard

This guide walks through setting up Google OAuth for Search Console, Analytics, and Ads access.

## Prerequisites

- Scramble Dashboard repo cloned and running locally
- Supabase project set up (already exists: `https://nozbcpzdkivpyfxcvrah.supabase.co`)
- Google Cloud project with OAuth consent configured

---

## Step 1: Create Google Cloud OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Enable these APIs:
   - **Google Search Console API**
   - **Google Analytics Admin API**
   - **Google Analytics Data API**
   - **Google Ads API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-scramble-domain.com/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

---

## Step 2: Set Up Supabase Tables

The OAuth tables are defined in `supabase/migrations/001_google_oauth.sql`.

Apply the migration manually in Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com/) → Your Project
2. Click **SQL Editor** → **New Query**
3. Copy-paste the contents of `supabase/migrations/001_google_oauth.sql`
4. Click **Run**

This creates:
- `google_oauth_connections` — stores active client-to-Google-account mappings
- `google_oauth_audit` — logs all OAuth events (connections, disconnects, errors)

---

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then update `.env.local`:

```
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://nozbcpzdkivpyfxcvrah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
# (Change to https://your-scramble-domain.com for production)
```

To find your Supabase keys:
1. Supabase Dashboard → Settings → API
2. Copy **Project URL** (the base URL)
3. Copy **anon public** key
4. Copy **service_role** key (keep this secret!)

---

## Step 4: Test Locally

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000/settings?clientId=test-client`.

You should see:
- A blue "Connect Google Account" button
- Clicking it redirects to Google login
- After login, it stores the token in Supabase and shows the connected email

---

## Step 5: Deploy to Production

### Via Vercel (if using Vercel for hosting)

1. Add these env vars to Vercel (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET` (secret)
   - `NEXT_PUBLIC_APP_URL` = your production domain

2. Update Google Cloud Console redirect URIs to include your production domain

3. Deploy as usual: `git push` or `vercel deploy --prod`

### Via Hostinger VPS

1. SSH into your VPS
2. Update `.env` with production values
3. Rebuild and restart the app:
   ```bash
   npm run build
   npm start
   ```
4. Add production domain to Google Cloud Console redirect URIs

---

## How It Works

### Flow for Users (Clients)

1. Client visits `/settings?clientId=acme-corp`
2. Clicks "Connect Google Account"
3. Redirected to Google login (with offline access for refresh tokens)
4. After auth, redirected back to `/api/auth/google/callback?code=...&state=acme-corp`
5. Backend exchanges code for tokens and stores in Supabase
6. Settings page reloads showing connected status + scopes

### Flow for Data Fetching

When you need to pull Search Console / Analytics / Ads data:

1. Query Supabase for the client's `google_oauth_connections` row
2. Check if token is expired; if so, use `refresh_token` to get a new one
3. Use the `access_token` to call Google APIs directly (bypassing Maton for client data)

Example:
```typescript
const { data: connection } = await supabase
  .from('google_oauth_connections')
  .select('access_token, refresh_token, token_expires_at')
  .eq('client_id', clientId)
  .single()

// Refresh if needed
if (new Date(connection.token_expires_at) < new Date()) {
  connection.access_token = await refreshGoogleToken(connection.refresh_token)
}

// Use token to call Google APIs
const response = await fetch('https://www.googleapis.com/analytics/v3/management/accounts', {
  headers: { Authorization: `Bearer ${connection.access_token}` }
})
```

---

## Scope Reference

The OAuth flow requests these scopes:

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/search_console` | Read Search Console (keywords, rankings, impressions) |
| `https://www.googleapis.com/auth/analytics.readonly` | Read Google Analytics 4 data |
| `https://www.googleapis.com/auth/analytics.manage` | Manage GA4 properties (view creation, settings) |
| `https://www.googleapis.com/auth/adwords` | Read Google Ads (campaigns, spend, conversions) |

---

## Troubleshooting

### "Missing Google OAuth env vars"
- Check that `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_APP_URL` are set in `.env.local`

### "redirect_uri_mismatch"
- Your redirect URI in Google Cloud Console doesn't match the one in `NEXT_PUBLIC_APP_URL`
- Make sure Google Cloud has BOTH `http://localhost:3000/api/auth/google/callback` (local) AND your production domain

### Token not being stored
- Check Supabase dashboard that the `google_oauth_connections` table exists
- Check browser console for errors during callback
- Check Vercel/server logs for token exchange errors

### "Unauthorized" errors when calling Google APIs
- Token may be expired — use `refresh_token` to get a new one
- Verify the scopes requested include what you're trying to access

---

## Next Steps

Once OAuth is working, you can:

1. **Build the data-fetch layer** — pull Search Console rankings, Analytics traffic, Ads spend
2. **Create client dashboards** — display the fetched data per client
3. **Auto-refresh logic** — scheduled cron job to refresh tokens before expiry
4. **Error handling** — graceful fallbacks if token revocation happens

---

## Questions?

Ask Herbie or Gabriel. This setup is stable and tested as of 2026-08-31.
