create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on table public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profile_updated_at on public.profiles;
create trigger set_profile_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profile_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create table if not exists public.tributes (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'Anonymous Explorer'
    check (char_length(author) <= 50),
  callsign text not null default 'Observer'
    check (char_length(callsign) <= 30),
  probe text not null
    check (probe in ('opportunity', 'voyager1', 'spirit', 'cassini', 'apollo15')),
  message text not null
    check (char_length(btrim(message)) between 1 and 500),
  created_at timestamptz not null default now(),
  hearts integer not null default 1 check (hearts >= 0)
);

alter table public.tributes enable row level security;

drop policy if exists "Anyone can read tributes" on public.tributes;
create policy "Anyone can read tributes"
  on public.tributes
  for select
  to anon
  using (true);

drop policy if exists "Anyone can add tributes" on public.tributes;
create policy "Anyone can add tributes"
  on public.tributes
  for insert
  to anon
  with check (true);

revoke all on table public.tributes from anon, authenticated;
grant select, insert on public.tributes to anon;

insert into public.tributes (id, author, callsign, probe, message, created_at, hearts)
values
  ('00000000-0000-4000-8000-000000000001', 'Elena Rostova', 'Stargazer-9', 'opportunity',
    'You taught an entire generation that a machine built of aluminum and silicon could have a soul. 5,111 sols under a foreign sky. Rest easy, Oppy.',
    '2026-11-01T12:00:00Z', 142),
  ('00000000-0000-4000-8000-000000000002', 'Kavita Rao', 'ISRO-Fellow', 'voyager1',
    'Whenever I feel small on this Earth, I look out at night and remember: our song, our laughter, and our heartbeat are sailing through the interstellar dark.',
    '2026-11-04T12:00:00Z', 98),
  ('00000000-0000-4000-8000-000000000003', 'Marcus Chen', 'Titan-Survey', 'cassini',
    'You plunged into Saturn so Enceladus could dream in peace. The most noble death in the history of science.',
    '2026-11-06T12:00:00Z', 115),
  ('00000000-0000-4000-8000-000000000004', 'Sarah Lindqvist', 'Polaris-4', 'spirit',
    'Climbing Husband Hill with a seized wheel. You never gave up, not even when the sand at Troy claimed your tracks. Thank you for showing us what grit means.',
    '2026-11-08T12:00:00Z', 76),
  ('00000000-0000-4000-8000-000000000005', 'David Miller', 'Apollo-Kids', 'apollo15',
    'Still parked by Hadley Rille, waiting under the unchanging stars. The fastest set of wheels on the Moon.',
    '2026-11-10T12:00:00Z', 54),
  ('00000000-0000-4000-8000-000000000006', 'Dr. Amara Thorne', 'DeepSpace-Echo', 'opportunity',
    'I was ten years old when you bounced onto Eagle Crater, and I had finished my astrophysics doctorate by the time your final storm arrived. You guided my whole life.',
    '2026-11-12T12:00:00Z', 89)
on conflict (id) do nothing;
