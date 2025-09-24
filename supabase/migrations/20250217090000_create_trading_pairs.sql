-- Create table for tracking user trading pairs
set check_function_bodies = off;

create table if not exists public.trading_pairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  inserted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trading_pairs_symbol_uppercase check (symbol = upper(symbol))
);

create unique index if not exists trading_pairs_user_symbol_idx on public.trading_pairs(user_id, symbol);
create index if not exists trading_pairs_user_id_idx on public.trading_pairs(user_id);

create trigger set_trading_pairs_updated_at
  before update on public.trading_pairs
  for each row
  execute function public.set_updated_at();

alter table public.trading_pairs enable row level security;

drop policy if exists "Users can view their trading pairs" on public.trading_pairs;
create policy "Users can view their trading pairs"
  on public.trading_pairs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their trading pairs" on public.trading_pairs;
create policy "Users can insert their trading pairs"
  on public.trading_pairs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their trading pairs" on public.trading_pairs;
create policy "Users can update their trading pairs"
  on public.trading_pairs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their trading pairs" on public.trading_pairs;
create policy "Users can delete their trading pairs"
  on public.trading_pairs
  for delete
  using (auth.uid() = user_id);
