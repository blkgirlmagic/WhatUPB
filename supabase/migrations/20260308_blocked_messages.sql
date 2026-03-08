-- ---------------------------------------------------------------------------
--  blocked_messages — logs pre-moderation filter blocks (PII, spam, URLs, etc.)
--
--  Privacy: NO raw message content is stored.  Only the reject reason
--  and hashed sender IP are recorded.
-- ---------------------------------------------------------------------------

create table if not exists public.blocked_messages (
  id          uuid          default gen_random_uuid() primary key,
  created_at  timestamptz   default now() not null,
  reason      text          not null,       -- phone_number | email | social_handle | url | spam_repetition | doxxing_phrase
  ip_hash     text                          -- SHA-256 prefix of sender IP (not raw IP)
);

-- RLS: service role inserts only, authenticated users can read for admin dashboard.
alter table blocked_messages enable row level security;

create policy "No direct inserts on blocked_messages"
  on public.blocked_messages
  for insert
  with check (false);

create policy "Authenticated users can read blocked_messages"
  on public.blocked_messages
  for select
  using (auth.uid() is not null);

create policy "No direct deletes on blocked_messages"
  on public.blocked_messages
  for delete
  using (false);

-- Indexes for querying
create index if not exists idx_blocked_messages_created
  on public.blocked_messages (created_at desc);

create index if not exists idx_blocked_messages_reason
  on public.blocked_messages (reason, created_at desc);

create index if not exists idx_blocked_messages_ip_hash
  on public.blocked_messages (ip_hash, created_at desc)
  where ip_hash is not null;

-- ---------------------------------------------------------------------------
--  SECURITY DEFINER function: log_blocked_message
--  Called from the API route via supabase.rpc().  Bypasses RLS.
--  Same pattern as log_moderation_block.
-- ---------------------------------------------------------------------------

create or replace function public.log_blocked_message(
  p_reason   text,
  p_ip_hash  text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.blocked_messages (reason, ip_hash)
  values (p_reason, p_ip_hash);

  return json_build_object('success', true);
end;
$$;
