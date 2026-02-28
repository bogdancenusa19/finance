-- ============================================================
--  FinTrack — Schema Supabase
--  Ruleaza in SQL Editor din dashboard.supabase.com
-- ============================================================

-- 1. TRANSACTIONS
create table if not exists transactions (
  id            uuid default gen_random_uuid() primary key,
  date          date not null,
  month         int not null,
  year          int not null,
  category      text not null default 'Altele',
  description   text,
  amount        numeric(10,2) not null,
  payment_type  text default 'Card',
  recurring     boolean default false,
  notes         text,
  created_at    timestamptz default now()
);

-- 2. INCOME
create table if not exists income (
  id            uuid default gen_random_uuid() primary key,
  year          int not null,
  month         int not null,
  salary        numeric(10,2) default 0,
  bonus         numeric(10,2) default 0,
  other         numeric(10,2) default 0,
  total_income  numeric(10,2) generated always as (salary + bonus + other) stored,
  unique(year, month)
);

-- 3. BUDGET
create table if not exists budget (
  id            uuid default gen_random_uuid() primary key,
  year          int not null,
  month         int not null,
  category      text not null,
  amount        numeric(10,2) default 0,
  unique(year, month, category)
);

-- 4. MONTHLY SUMMARY VIEW (generat automat)
create or replace view monthly_summary as
select
  t.year,
  t.month,
  sum(t.amount)                           as total_expenses,
  count(*)                                as transaction_count,
  json_object_agg(t.category, cat_sum)    as expenses_by_category
from transactions t
join (
  select year, month, category, sum(amount) as cat_sum
  from transactions
  group by year, month, category
) cs using (year, month, category)
group by t.year, t.month;

-- 5. ROW LEVEL SECURITY (doar tu accesezi)
alter table transactions enable row level security;
alter table income enable row level security;
alter table budget enable row level security;

-- Permite orice operatie userului autentificat
create policy "auth_all" on transactions for all using (auth.uid() is not null);
create policy "auth_all" on income for all using (auth.uid() is not null);
create policy "auth_all" on budget for all using (auth.uid() is not null);

-- Index pentru performance
create index if not exists idx_transactions_year_month on transactions(year, month);
create index if not exists idx_transactions_category on transactions(category);

-- ============================================================
-- Dupa ce rulezi schema:
-- 1. Du-te la Authentication > Users > Add user
-- 2. Adauga email-ul si parola ta
-- ============================================================
