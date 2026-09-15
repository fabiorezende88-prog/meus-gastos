-- MEUS GASTOS - configuração do banco Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.expenses (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  type text not null check (type in ('fixed','variable')),
  category text not null,
  description text not null default '',
  expense_date date not null,
  created_at bigint not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null check (month ~ '^\\d{4}-\\d{2}$'),
  amount numeric(14,2) not null check (amount > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create table if not exists public.category_budgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null check (month ~ '^\\d{4}-\\d{2}$'),
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, month, category)
);

alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.category_budgets enable row level security;

drop policy if exists "expenses_select_own" on public.expenses;
drop policy if exists "expenses_insert_own" on public.expenses;
drop policy if exists "expenses_update_own" on public.expenses;
drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);

drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

drop policy if exists "category_budgets_select_own" on public.category_budgets;
drop policy if exists "category_budgets_insert_own" on public.category_budgets;
drop policy if exists "category_budgets_update_own" on public.category_budgets;
drop policy if exists "category_budgets_delete_own" on public.category_budgets;
create policy "category_budgets_select_own" on public.category_budgets for select using (auth.uid() = user_id);
create policy "category_budgets_insert_own" on public.category_budgets for insert with check (auth.uid() = user_id);
create policy "category_budgets_update_own" on public.category_budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "category_budgets_delete_own" on public.category_budgets for delete using (auth.uid() = user_id);

-- Realtime para que computador e iPhone recebam alterações automaticamente.
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.budgets;
alter publication supabase_realtime add table public.category_budgets;
