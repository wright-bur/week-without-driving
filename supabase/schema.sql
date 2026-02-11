create extension if not exists "pgcrypto";

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  created_at timestamptz not null default now(),
  parent_status text,
  area_type text,
  current_day int not null default 1,
  completed boolean not null default false
);

create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  day int not null,
  trip_type text,
  trip_mode text[] not null default '{}',
  almost_broke_tags text[] not null default '{}',
  almost_broke_text text,
  surprise text,
  publish_ok boolean not null default false,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  unique (participant_id, day),
  check (day >= 1 and day <= 7)
);

create table if not exists card_candidates (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete set null,
  day int,
  text text not null,
  card_type text,
  tags text[] not null default '{}',
  status text not null default 'pending',
  flagged boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists card_candidates_status_idx on card_candidates (status);
create index if not exists card_candidates_created_idx on card_candidates (created_at desc);
create index if not exists card_candidates_type_idx on card_candidates (card_type);
create index if not exists card_candidates_tags_idx on card_candidates using gin (tags);

alter table participants enable row level security;
alter table daily_entries enable row level security;
alter table card_candidates enable row level security;

create policy "participants_select_own" on participants
  for select using (auth.uid() = auth_user_id);

create policy "participants_insert_own" on participants
  for insert with check (auth.uid() = auth_user_id);

create policy "participants_update_own" on participants
  for update using (auth.uid() = auth_user_id);

create policy "daily_entries_select_own" on daily_entries
  for select using (
    participant_id in (select id from participants where auth_user_id = auth.uid())
  );

create policy "daily_entries_insert_own" on daily_entries
  for insert with check (
    participant_id in (select id from participants where auth_user_id = auth.uid())
  );

create policy "daily_entries_update_own" on daily_entries
  for update using (
    participant_id in (select id from participants where auth_user_id = auth.uid())
  );

create policy "card_candidates_public_select" on card_candidates
  for select using (status = 'approved');
