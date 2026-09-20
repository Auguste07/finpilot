-- FinPilot historisation and notification preferences
create table if not exists public.financial_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('budget','planned_expense','allocation','transaction','project')),
  entity_id uuid,
  period_start date,
  period_end date,
  snapshot jsonb not null default '{}'::jsonb,
  archived_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists financial_history_user_period_idx on public.financial_history(user_id,period_start,period_end);
alter table public.financial_history enable row level security;
create policy "financial_history_own" on public.financial_history for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  browser_enabled boolean not null default false,
  email_enabled boolean not null default true,
  default_reminder_days smallint not null default 3 check(default_reminder_days between 0 and 90),
  quiet_hours_start time,
  quiet_hours_end time,
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
create policy "notification_preferences_own" on public.notification_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
