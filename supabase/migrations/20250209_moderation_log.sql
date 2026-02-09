-- ---------------------------------------------------------------------------
--  moderation_log — stores metadata for every blocked message attempt.
--
--  Privacy: NO raw message content is stored.  Only the moderation verdict,
--  scores, and hashed sender IP are recorded.
-- ---------------------------------------------------------------------------

create table if not exists public.moderation_log (
  id            uuid          default gen_random_uuid() primary key,
  blocked_by    text          not null,                    -- 'local' | 'perspective' | 'rate_limit'
  reason        text,                                      -- reject reason code
  scores        jsonb,                                     -- Perspective attribute scores (nullable)
  ip_hash       text,                                      -- SHA-256 prefix of sender IP
  recipient_id  uuid          references public.profiles(id) on delete set null,
  created_at    timestamptz   default now()
);

-- RLS: only authenticated users with admin role can read.
-- For now we use a simple "authenticated user" check — tighten this
-- to an admin role or specific user IDs as needed.
alter table public.moderation_log enable row level security;

-- Nobody can insert directly via client — the API route uses the service role
-- or a SECURITY DEFINER function.
create policy "No direct inserts on moderation_log"
  on public.moderation_log
  for insert
  with check (false);

-- Only authenticated users can read (admin endpoint will use service role to bypass)
create policy "Authenticated users can read moderation_log"
  on public.moderation_log
  for select
  using (auth.uid() is not null);

-- No direct deletes
create policy "No direct deletes on moderation_log"
  on public.moderation_log
  for delete
  using (false);

-- Index for querying recent blocks
create index if not exists idx_moderation_log_created
  on public.moderation_log (created_at desc);

create index if not exists idx_moderation_log_blocked_by
  on public.moderation_log (blocked_by, created_at desc);

create index if not exists idx_moderation_log_ip_hash
  on public.moderation_log (ip_hash, created_at desc)
  where ip_hash is not null;

-- ---------------------------------------------------------------------------
--  SECURITY DEFINER function: log_moderation_block
--  Called from the API route via supabase.rpc().  Bypasses RLS.
-- ---------------------------------------------------------------------------

create or replace function public.log_moderation_block(
  p_blocked_by   text,
  p_reason       text,
  p_scores       jsonb,
  p_ip_hash      text,
  p_recipient_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.moderation_log (blocked_by, reason, scores, ip_hash, recipient_id)
  values (p_blocked_by, p_reason, p_scores, p_ip_hash, p_recipient_id);

  return json_build_object('success', true);
end;
$$;
