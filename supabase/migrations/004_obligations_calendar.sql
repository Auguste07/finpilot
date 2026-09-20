create type public.obligation_direction as enum ('payable','receivable');
create type public.obligation_status as enum ('open','partial','settled','cancelled');

create table if not exists public.financial_obligations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction public.obligation_direction not null,
  counterparty text not null,
  label text not null,
  principal_amount numeric(18,2) not null check(principal_amount >= 0),
  settled_amount numeric(18,2) not null default 0 check(settled_amount >= 0),
  currency text not null default 'USD',
  due_date date,
  status public.obligation_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(settled_amount <= principal_amount)
);

create index if not exists financial_obligations_user_due_idx on public.financial_obligations(user_id,due_date);
alter table public.financial_obligations enable row level security;
create policy "financial_obligations_own" on public.financial_obligations for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table if not exists public.financial_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  event_type text not null check(event_type in ('planned_expense','income','budget','project','payable','receivable','reminder','custom')),
  source_id uuid,
  title text not null,
  amount numeric(18,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists financial_calendar_events_user_date_idx on public.financial_calendar_events(user_id,event_date);
alter table public.financial_calendar_events enable row level security;
create policy "financial_calendar_events_own" on public.financial_calendar_events for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
