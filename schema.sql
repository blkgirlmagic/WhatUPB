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

-- MESSAGES: anyone can insert (anonymous)
create policy "Anyone can send messages"
on public.messages
for insert
with check (true);

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
