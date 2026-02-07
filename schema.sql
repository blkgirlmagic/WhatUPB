-- EXTENSIONS (gen_random_uuid)
create extension if not exists "pgcrypto";

-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text,
  created_at timestamptz default now()
);

-- MESSAGES TABLE
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  sender_ip_hash text,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.messages enable row level security;

-- Policies (clean slate)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

drop policy if exists "Anyone can send messages" on public.messages;
drop policy if exists "No direct message inserts" on public.messages;
drop policy if exists "Users can read own messages" on public.messages;
drop policy if exists "Users can delete own messages" on public.messages;

-- PROFILES: public read (needed for /[username])
create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

-- PROFILES: user can update their own
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- MESSAGES: block ALL direct inserts via client/anon key.
-- The SECURITY DEFINER function below bypasses RLS for server-side inserts.
create policy "No direct message inserts"
on public.messages
for insert
with check (false);

-- MESSAGES: only recipient can read
create policy "Users can read own messages"
on public.messages
for select
using (auth.uid() = recipient_id);

-- MESSAGES: only recipient can delete
create policy "Users can delete own messages"
on public.messages
for delete
using (auth.uid() = recipient_id);

-- Indexes
create index if not exists idx_messages_recipient_id on public.messages(recipient_id);
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_messages_recipient_created
  on public.messages (recipient_id, created_at desc);
create index if not exists idx_messages_ip_hash_created
  on public.messages (sender_ip_hash, created_at desc)
  where sender_ip_hash is not null;

--------------------------------------------------------------------------------
-- TRIGGER: auto-create profile on auth user creation
-- Username comes from user metadata: raw_user_meta_data->>'username'
--------------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

--------------------------------------------------------------------------------
-- FUNCTION: rate-limited anonymous message insert (SECURITY DEFINER)
-- Called via supabase.rpc('send_anonymous_message', {...}) from the API route.
-- Bypasses RLS so it can insert despite WITH CHECK(false).
--------------------------------------------------------------------------------

create or replace function public.send_anonymous_message(
  p_recipient_id uuid,
  p_content text,
  p_ip_hash text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient_exists boolean;
  v_recent_count integer;
  v_rate_limit integer := 10;
  v_rate_window interval := '5 minutes';
  v_new_id uuid;
begin
  -- 1. Validate recipient exists
  select exists(
    select 1 from public.profiles where id = p_recipient_id
  ) into v_recipient_exists;

  if not v_recipient_exists then
    return json_build_object('success', false, 'error', 'Recipient not found');
  end if;

  -- 2. Validate content
  if p_content is null or length(trim(p_content)) < 1 then
    return json_build_object('success', false, 'error', 'Message cannot be empty');
  end if;

  if length(p_content) > 1000 then
    return json_build_object('success', false, 'error', 'Message too long (max 1000 characters)');
  end if;

  -- 3. Rate limit per recipient (max 10 messages to one user in 5 min)
  select count(*) into v_recent_count
  from public.messages
  where recipient_id = p_recipient_id
    and created_at > (now() - v_rate_window);

  if v_recent_count >= v_rate_limit then
    return json_build_object(
      'success', false,
      'error', 'Too many messages sent to this user recently. Please try again later.'
    );
  end if;

  -- 4. Rate limit per IP (max 10 messages from one IP in 5 min)
  if p_ip_hash is not null then
    select count(*) into v_recent_count
    from public.messages
    where sender_ip_hash = p_ip_hash
      and created_at > (now() - v_rate_window);

    if v_recent_count >= v_rate_limit then
      return json_build_object(
        'success', false,
        'error', 'You are sending messages too quickly. Please try again later.'
      );
    end if;
  end if;

  -- 5. Insert (bypasses RLS due to SECURITY DEFINER)
  insert into public.messages (recipient_id, content, sender_ip_hash)
  values (p_recipient_id, trim(p_content), p_ip_hash)
  returning id into v_new_id;

  return json_build_object('success', true, 'message_id', v_new_id);
end;
$$;
