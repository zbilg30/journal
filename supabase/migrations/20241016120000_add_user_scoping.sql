-- Add user scoping to setups and trade_days tables
alter table public.setups
  add column if not exists user_id uuid references auth.users(id);

alter table public.trade_days
  add column if not exists user_id uuid references auth.users(id);

create index if not exists setups_user_id_idx on public.setups(user_id);
create index if not exists trade_days_user_id_idx on public.trade_days(user_id);

drop view if exists public.monthly_trade_summary;

create or replace view public.monthly_trade_summary as
select
  user_id,
  month,
  sum(net) as net,
  sum(trades) as trade_count,
  count(*) as active_days,
  sum(case when net > 0 then net else 0 end) as gross_profit,
  sum(case when net < 0 then abs(net) else 0 end) as gross_loss
from public.trade_days
group by user_id, month;
