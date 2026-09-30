-- Lets a budget (global or per-category) apply either to the calendar month
-- (as before) or to the pay-cycle view, independently. For period_type =
-- 'payday', `month` reuses the same date column to store the start date of
-- the specific cycle being overridden (NULL still means "every cycle").
alter table public.budgets
  add column period_type text not null default 'calendar'
    check (period_type in ('calendar', 'payday'));

alter table public.budgets drop constraint budgets_unique_scope;
alter table public.budgets
  add constraint budgets_unique_scope unique nulls not distinct (user_id, category_id, period_type, month);

-- `month` used to always mean "the 1st of a calendar month". For period_type = 'payday'
-- it now stores a cycle's start date instead, which can be any day.
alter table public.budgets drop constraint budgets_month_check;
alter table public.budgets
  add constraint budgets_month_check check (month is null or period_type = 'payday' or extract(day from month) = 1);
