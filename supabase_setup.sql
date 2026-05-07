-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste this → Run

-- Downloads history table
create table if not exists public.downloads (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  url         text not null,
  title       text,
  platform    text,
  thumbnail   text,
  created_at  timestamptz default now() not null
);

-- Row Level Security: users can only see their own downloads
alter table public.downloads enable row level security;

create policy "Users can view own downloads"
  on public.downloads for select
  using (auth.uid() = user_id);

create policy "Users can insert own downloads"
  on public.downloads for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own downloads"
  on public.downloads for delete
  using (auth.uid() = user_id);

-- Index for fast lookups by user
create index if not exists downloads_user_id_idx on public.downloads(user_id);
