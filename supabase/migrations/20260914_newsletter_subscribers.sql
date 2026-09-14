-- ============================================================
-- Newsletter subscribers table + RLS + SECURITY DEFINER function
-- Migration: 20260914_newsletter_subscribers
-- ============================================================

-- Table
create table if not exists public.newsletter_subscribers (
  id         uuid        default gen_random_uuid() primary key,
  email      text        not null,
  created_at timestamptz default now(),
  status     text        not null default 'active',
  source     text
);

-- Unique index on normalized (lowercased) email — prevents duplicates
-- regardless of case the visitor typed.
create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

-- General index for fast lookups
create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers (email);

-- Enable RLS — no policy = anon/authenticated roles CANNOT
-- SELECT, INSERT, UPDATE, or DELETE directly.
-- All writes go through the SECURITY DEFINER function below.
alter table public.newsletter_subscribers enable row level security;

-- Explicit deny policies (belt-and-suspenders — RLS with no policy
-- already denies, but being explicit makes intent clear in the dashboard)
drop policy if exists "No public reads on newsletter_subscribers"
  on public.newsletter_subscribers;
create policy "No public reads on newsletter_subscribers"
  on public.newsletter_subscribers
  for select
  using (false);

drop policy if exists "No public inserts on newsletter_subscribers"
  on public.newsletter_subscribers;
create policy "No public inserts on newsletter_subscribers"
  on public.newsletter_subscribers
  for insert
  with check (false);

drop policy if exists "No public updates on newsletter_subscribers"
  on public.newsletter_subscribers;
create policy "No public updates on newsletter_subscribers"
  on public.newsletter_subscribers
  for update
  using (false);

drop policy if exists "No public deletes on newsletter_subscribers"
  on public.newsletter_subscribers;
create policy "No public deletes on newsletter_subscribers"
  on public.newsletter_subscribers
  for delete
  using (false);

-- ============================================================
-- FUNCTION: subscribe_newsletter (SECURITY DEFINER)
--
-- Called via supabase.rpc('subscribe_newsletter', {...}) from
-- the /api/newsletter/subscribe server-side route.
-- Runs as the function owner (bypasses RLS), so the anon key
-- can trigger it without any INSERT policy existing.
--
-- Returns JSON:
--   { success: true,  status: "subscribed" }
--   { success: true,  status: "already_subscribed" }
--   { success: false, error:  "<reason>" }
-- ============================================================
create or replace function public.subscribe_newsletter(
  p_email  text,
  p_source text default 'website'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
  v_rows       int;
begin
  -- Normalize
  v_normalized := lower(trim(p_email));

  -- Validate: not empty
  if v_normalized is null or v_normalized = '' then
    return json_build_object('success', false, 'error', 'missing_email');
  end if;

  -- Validate: basic email shape
  if v_normalized !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$' then
    return json_build_object('success', false, 'error', 'invalid_email');
  end if;

  -- Insert, silently skip on duplicate
  insert into public.newsletter_subscribers (email, status, source)
  values (v_normalized, 'active', p_source)
  on conflict (lower(email)) do nothing;

  -- ROW_COUNT = 1 if inserted, 0 if conflict skipped
  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    return json_build_object('success', true, 'status', 'subscribed');
  else
    return json_build_object('success', true, 'status', 'already_subscribed');
  end if;

exception
  when others then
    return json_build_object('success', false, 'error', 'server_error');
end;
$$;
