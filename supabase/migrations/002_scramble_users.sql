-- Scramble client accounts + selected services (Herbie 2026-08-31)
-- Uses Supabase Auth for identity; this table holds profile + subscription info.

create table if not exists scramble_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Links to Supabase auth.users
  auth_user_id uuid unique,

  -- Profile
  email text not null unique,
  company_name text not null,

  -- Subscription tier: 'seo' | 'ads' | 'full'
  tier text not null default 'full',

  -- Which service dashboards this user has access to.
  -- Derived from tier but stored explicitly for flexibility:
  --   seo  → ['search_console', 'analytics']
  --   ads  → ['ads']
  --   full → ['search_console', 'analytics', 'ads']
  services text[] not null default array['search_console','analytics','ads']::text[],

  -- Onboarding
  onboarding_complete boolean default false,
  google_connected boolean default false,

  -- Status
  is_active boolean default true
);

create index if not exists idx_scramble_users_auth on scramble_users(auth_user_id);
create index if not exists idx_scramble_users_email on scramble_users(email);

alter table scramble_users enable row level security;

-- Users can read/update their own row; service role bypasses RLS for admin ops.
create policy "Users read own profile" on scramble_users
  for select using (auth.uid() = auth_user_id);
create policy "Users update own profile" on scramble_users
  for update using (auth.uid() = auth_user_id);
create policy "Users insert own profile" on scramble_users
  for insert with check (auth.uid() = auth_user_id);
