-- Create storage bucket dedicated to trade screenshots and metadata table
set check_function_bodies = off;

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'trade-screenshots') then
    insert into storage.buckets (id, name, public)
    values ('trade-screenshots', 'trade-screenshots', false);
  end if;
end;
$$;

create table if not exists public.trade_day_images (
  id uuid primary key default gen_random_uuid(),
  trade_day_id uuid not null references public.trade_days(id) on delete cascade,
  bucket_id text not null,
  storage_path text not null,
  content_type text,
  position integer default 0,
  user_id uuid not null references auth.users(id),
  inserted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trade_day_images_path_unique unique (bucket_id, storage_path)
);

create index if not exists trade_day_images_trade_day_id_idx on public.trade_day_images(trade_day_id);
create index if not exists trade_day_images_user_id_idx on public.trade_day_images(user_id);

drop trigger if exists set_trade_day_images_updated_at on public.trade_day_images;
create trigger set_trade_day_images_updated_at
before update on public.trade_day_images
for each row
execute procedure public.set_updated_at();
