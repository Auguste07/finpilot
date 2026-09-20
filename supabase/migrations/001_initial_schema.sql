-- FinPilot initial schema. Apply in a fresh Supabase project.
create extension if not exists pgcrypto;

create type public.transaction_kind as enum ('income','expense');
create type public.entry_status as enum ('draft','planned','pending','cleared','cancelled');
create type public.recurrence_unit as enum ('none','weekly','monthly','quarterly','yearly','custom');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  base_currency text not null default 'USD' check (char_length(base_currency)=3),
  budget_month_start smallint not null default 1 check (budget_month_start between 1 and 28),
  savings_target numeric(5,2) not null default 20 check (savings_target between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'USD',
  opening_balance numeric(18,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id,name)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind public.transaction_kind not null,
  parent_id uuid references public.categories(id) on delete set null,
  monthly_budget numeric(18,2),
  created_at timestamptz not null default now(),
  unique(user_id,name,kind)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(18,2) not null check (target_amount >= 0),
  allocated_amount numeric(18,2) not null default 0 check (allocated_amount >= 0),
  deadline date,
  status text not null default 'active' check(status in ('active','paused','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  kind public.transaction_kind not null,
  amount numeric(18,2) not null check(amount >= 0),
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  recurrence public.recurrence_unit not null default 'monthly',
  recurrence_interval smallint not null default 1 check(recurrence_interval > 0),
  next_due_date date not null,
  end_date date,
  confidence numeric(5,2) not null default 100 check(confidence between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_on date not null,
  label text not null,
  description text,
  kind public.transaction_kind not null,
  status public.entry_status not null default 'cleared',
  amount numeric(18,2) not null check(amount >= 0),
  currency text not null default 'USD',
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  recurring_rule_id uuid references public.recurring_rules(id) on delete set null,
  source text not null default 'manual' check(source in ('manual','excel','recurrence','conversion')),
  import_fingerprint text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index transactions_import_dedupe on public.transactions(user_id,import_fingerprint) where import_fingerprint is not null;
create index transactions_user_date on public.transactions(user_id,occurred_on desc);

create table public.planned_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount numeric(18,2) not null check(amount >= 0),
  due_date date not null,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  recurring_rule_id uuid references public.recurring_rules(id) on delete set null,
  confidence numeric(5,2) not null default 80 check(confidence between 0 and 100),
  status public.entry_status not null default 'planned',
  converted_transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default now()
);
create index planned_user_due on public.planned_expenses(user_id,due_date);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  allocation_type text not null check(allocation_type in ('category','project','savings','insurance','reserve','custom')),
  target_id uuid,
  percentage numeric(5,2) check(percentage is null or percentage between 0 and 100),
  fixed_amount numeric(18,2) check(fixed_amount is null or fixed_amount >= 0),
  priority smallint not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check(percentage is not null or fixed_amount is not null)
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  row_count integer not null default 0,
  imported_count integer not null default 0,
  duplicate_count integer not null default 0,
  mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on every exposed table.
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.transactions enable row level security;
alter table public.planned_expenses enable row level security;
alter table public.allocations enable row level security;
alter table public.import_batches enable row level security;

-- Ownership policies: authenticated users only see and mutate their own rows.
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "accounts_own" on public.accounts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "categories_own" on public.categories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "projects_own" on public.projects for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "recurring_rules_own" on public.recurring_rules for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "transactions_own" on public.transactions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "planned_expenses_own" on public.planned_expenses for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "allocations_own" on public.allocations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "import_batches_own" on public.import_batches for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Automatically create a basic profile when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
