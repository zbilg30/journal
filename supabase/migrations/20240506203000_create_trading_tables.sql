-- Create core tables for trading journal domain
set check_function_bodies = off;

-- Ensure uuid generation is available
create extension if not exists "pgcrypto" with schema public;

-- Domain enumerations
create type public.trade_direction as enum ('long', 'short');
create type public.trade_close_method as enum ('tp', 'sl', 'manual');

-- Trading setups catalog
create table public.setups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bias text not null,
  description text not null,
  focus_tag text,
  last_executed date,
  stats_win_rate numeric(5, 2),
  stats_avg_r numeric(6, 2),
  stats_sample integer check (stats_sample is null or stats_sample >= 0),
  inserted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Daily trade entries captured in the journal
create table public.trade_days (
  id uuid primary key default gen_random_uuid(),
  trade_date date not null,
  month text not null,
  net numeric(14, 2) not null,
  trades integer not null check (trades >= 0),
  pair text not null,
  rr numeric(7, 2),
  direction public.trade_direction not null,
  session text,
  closed_by public.trade_close_method not null,
  risk_percent numeric(6, 3),
  emotion text,
  with_plan boolean not null default false,
  description text,
  setup_id uuid references public.setups(id) on update cascade on delete set null,
  inserted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index trade_days_month_idx on public.trade_days(month);
create index trade_days_trade_date_idx on public.trade_days(trade_date);
create index trade_days_setup_id_idx on public.trade_days(setup_id);

-- Keep updated_at columns in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_setups_updated_at
before update on public.setups
for each row
execute procedure public.set_updated_at();

create trigger set_trade_days_updated_at
before update on public.trade_days
for each row
execute procedure public.set_updated_at();

-- Aggregated monthly performance view mirroring API summary expectations
create or replace view public.monthly_trade_summary as
select
  month,
  sum(net) as net,
  sum(trades) as trade_count,
  count(*) as active_days,
  sum(case when net > 0 then net else 0 end) as gross_profit,
  sum(case when net < 0 then abs(net) else 0 end) as gross_loss
from public.trade_days
group by month;
