-- Optional payday (1-31) used to show spending by "pay cycle" (payday to the
-- day before the next payday) instead of the calendar month, on Home,
-- Transactions and Analytics. Budgets stay calendar-month only.
alter table public.profiles
  add column payday smallint check (payday is null or payday between 1 and 31);
