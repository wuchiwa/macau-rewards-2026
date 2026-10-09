-- 澳門消費連環賞 2026 V2
-- 在 Supabase Dashboard > SQL Editor 執行整份檔案。
create extension if not exists pgcrypto;

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  owner_name text not null default '自己',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  spent_on date not null default current_date,
  amount numeric(12,2) not null check (amount > 0),
  merchant text not null check (char_length(trim(merchant)) between 1 and 100),
  tx_type text not null default '一般消費',
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);
create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  claimed_on date not null default current_date,
  result_type text not null default 'thanks' check (result_type in ('thanks','coupon')),
  coupon_value integer check ((result_type = 'thanks' and coupon_value is null) or (result_type = 'coupon' and coupon_value in (10,20,50,100,200))),
  redeemed boolean not null default false,
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists wallets_user_id_idx on public.wallets(user_id);
create index if not exists transactions_user_date_idx on public.transactions(user_id, spent_on desc);
create index if not exists transactions_wallet_idx on public.transactions(wallet_id);
create index if not exists claims_user_date_idx on public.reward_claims(user_id, claimed_on desc);
create index if not exists claims_wallet_idx on public.reward_claims(wallet_id);
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.reward_claims enable row level security;

drop policy if exists wallets_select_own on public.wallets;
create policy wallets_select_own on public.wallets for select to authenticated using (auth.uid() = user_id);
drop policy if exists wallets_insert_own on public.wallets;
create policy wallets_insert_own on public.wallets for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists wallets_update_own on public.wallets;
create policy wallets_update_own on public.wallets for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists wallets_delete_own on public.wallets;
create policy wallets_delete_own on public.wallets for delete to authenticated using (auth.uid() = user_id);

drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own on public.transactions for select to authenticated using (auth.uid() = user_id);
drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own on public.transactions for insert to authenticated with check (auth.uid() = user_id and exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));
drop policy if exists transactions_update_own on public.transactions;
create policy transactions_update_own on public.transactions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));
drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_delete_own on public.transactions for delete to authenticated using (auth.uid() = user_id);

drop policy if exists claims_select_own on public.reward_claims;
create policy claims_select_own on public.reward_claims for select to authenticated using (auth.uid() = user_id);
drop policy if exists claims_insert_own on public.reward_claims;
create policy claims_insert_own on public.reward_claims for insert to authenticated with check (auth.uid() = user_id and exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));
drop policy if exists claims_update_own on public.reward_claims;
create policy claims_update_own on public.reward_claims for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));
drop policy if exists claims_delete_own on public.reward_claims;
create policy claims_delete_own on public.reward_claims for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.wallets to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.reward_claims to authenticated;
revoke all on public.wallets from anon;
revoke all on public.transactions from anon;
revoke all on public.reward_claims from anon;
