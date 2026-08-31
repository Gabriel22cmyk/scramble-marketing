-- Google OAuth connections for clients (Herbie 2026-08-31)
-- Stores which client has connected which Google account and what tokens they have

create table if not exists google_oauth_connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Client reference (from clients table)
  client_id text not null,
  
  -- Google account info
  google_account_email text not null,
  google_account_id text not null,
  
  -- Token storage (encrypted at rest by Supabase)
  access_token text not null,
  refresh_token text,
  token_expires_at timestamp with time zone,
  
  -- Scope tracking (comma-separated list of granted scopes)
  granted_scopes text not null,
  
  -- Status
  is_active boolean default true,
  last_used_at timestamp with time zone,
  revoked_at timestamp with time zone,
  
  unique(client_id, google_account_id)
);

-- Index for quick lookups
create index if not exists idx_google_oauth_client on google_oauth_connections(client_id);
create index if not exists idx_google_oauth_email on google_oauth_connections(google_account_email);

-- RLS: Disable for now (will add per-client scoping if multi-tenant)
alter table google_oauth_connections enable row level security;

-- Allow anyone to read/write their own connections (basic setup)
-- In production, this should be scoped to authenticated users
create policy "Allow all access" on google_oauth_connections
  for all using (true) with check (true);

-- Audit log for token refreshes and errors
create table if not exists google_oauth_audit (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  
  connection_id uuid not null references google_oauth_connections(id) on delete cascade,
  event_type text not null, -- 'token_refresh', 'token_error', 'api_call', 'revoke'
  details jsonb,
  
  error_message text
);

create index if not exists idx_oauth_audit_connection on google_oauth_audit(connection_id);
create index if not exists idx_oauth_audit_type on google_oauth_audit(event_type);
