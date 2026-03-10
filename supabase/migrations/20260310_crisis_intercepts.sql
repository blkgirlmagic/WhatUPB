-- ---------------------------------------------------------------------------
--  crisis_intercepts — logs when a self-harm message is blocked
--
--  Privacy: NO message content is EVER stored.  Only the timestamp
--  and hashed sender IP are recorded.  This table exists purely to
--  track how often the crisis safety net fires.
-- ---------------------------------------------------------------------------

create table if not exists public.crisis_intercepts (
  id          uuid          default gen_random_uuid() primary key,
  created_at  timestamptz   default now() not null,
  ip_hash     text                          -- SHA-256 prefix of sender IP (not raw IP)
);

-- RLS: no direct inserts, authenticated users can read for admin dashboard.
alter table crisis_intercepts enable row level security;

create policy "No direct inserts on crisis_intercepts"
  on public.crisis_intercepts
  for insert
  with check (false);

create policy "Authenticated users can read crisis_intercepts"
  on public.crisis_intercepts
  for select
  using (auth.uid() is not null);

create policy "No direct deletes on crisis_intercepts"
  on public.crisis_intercepts
  for delete
  using (false);

-- Indexes
create index if not exists idx_crisis_intercepts_created
  on public.crisis_intercepts (created_at desc);

create index if not exists idx_crisis_intercepts_ip_hash
  on public.crisis_intercepts (ip_hash, created_at desc)
  where ip_hash is not null;

-- ---------------------------------------------------------------------------
--  SECURITY DEFINER function: log_crisis_intercept
--  Called from the API route via supabase.rpc().  Bypasses RLS.
--  Stores ONLY timestamp and IP hash — NO message content.
-- ---------------------------------------------------------------------------

create or replace function public.log_crisis_intercept(
  p_ip_hash  text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.crisis_intercepts (ip_hash)
  values (p_ip_hash);

  return json_build_object('success', true);
end;
$$;
