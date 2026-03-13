create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  color text not null,
  icon text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  description text,
  icon text,
  color text not null,
  habit_type text not null check (habit_type in ('binary', 'count', 'duration')),
  frequency_type text not null check (frequency_type in ('daily', 'weekdays', 'weekly_count', 'monthly_count', 'custom')),
  target_value integer,
  target_unit text,
  days_of_week integer[],
  weekly_target_count integer,
  monthly_target_count integer,
  custom_frequency jsonb,
  start_date date not null,
  end_date date,
  challenge_duration integer,
  notes text,
  is_archived boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  entry_date date not null,
  status text not null check (status in ('pending', 'completed', 'partial', 'missed', 'skipped')),
  completed boolean not null default false,
  numeric_value integer,
  duration_minutes integer,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_id, entry_date)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  target_days integer,
  status text not null check (status in ('active', 'completed', 'failed', 'paused')),
  rules_json jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenge_habits (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (challenge_id, habit_id)
);

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade unique,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  week_starts_on integer not null default 1 check (week_starts_on between 0 and 6),
  timezone text not null default 'UTC',
  default_dashboard_range text not null default '8w' check (default_dashboard_range in ('4w', '8w', '12w')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_user_name_unique_idx on public.categories (user_id, lower(name));
create index if not exists habits_user_active_idx on public.habits (user_id, is_active, is_archived);
create index if not exists habits_user_category_idx on public.habits (user_id, category_id);
create index if not exists habit_entries_habit_date_idx on public.habit_entries (habit_id, entry_date desc);
create index if not exists habit_entries_user_date_idx on public.habit_entries (user_id, entry_date desc);
create index if not exists challenges_user_status_idx on public.challenges (user_id, status);
create index if not exists daily_notes_user_date_idx on public.daily_notes (user_id, entry_date desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_habits_updated_at on public.habits;
create trigger set_habits_updated_at
before update on public.habits
for each row
execute function public.set_updated_at();

drop trigger if exists set_habit_entries_updated_at on public.habit_entries;
create trigger set_habit_entries_updated_at
before update on public.habit_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_challenges_updated_at on public.challenges;
create trigger set_challenges_updated_at
before update on public.challenges
for each row
execute function public.set_updated_at();

drop trigger if exists set_daily_notes_updated_at on public.daily_notes;
create trigger set_daily_notes_updated_at
before update on public.daily_notes
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, email, full_name, avatar_url)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name'),
  users.raw_user_meta_data->>'avatar_url'
from auth.users as users
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

insert into public.user_preferences (user_id)
select users.id
from auth.users as users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_habits enable row level security;
alter table public.daily_notes enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
create policy "profiles own rows"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "categories own rows" on public.categories;
create policy "categories own rows"
on public.categories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "habits own rows" on public.habits;
create policy "habits own rows"
on public.habits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "habit_entries own rows" on public.habit_entries;
create policy "habit_entries own rows"
on public.habit_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "challenges own rows" on public.challenges;
create policy "challenges own rows"
on public.challenges
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "challenge_habits via owned challenge" on public.challenge_habits;
create policy "challenge_habits via owned challenge"
on public.challenge_habits
for all
using (
  exists (
    select 1
    from public.challenges
    where public.challenges.id = challenge_habits.challenge_id
      and public.challenges.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.challenges
    where public.challenges.id = challenge_habits.challenge_id
      and public.challenges.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.habits
    where public.habits.id = challenge_habits.habit_id
      and public.habits.user_id = auth.uid()
  )
);

drop policy if exists "daily_notes own rows" on public.daily_notes;
create policy "daily_notes own rows"
on public.daily_notes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "preferences own rows" on public.user_preferences;
create policy "preferences own rows"
on public.user_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
