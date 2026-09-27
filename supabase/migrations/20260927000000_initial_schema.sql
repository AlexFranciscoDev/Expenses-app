-- =============================================================
-- Ledger — initial schema
-- Tables: profiles, categories, transactions, budgets
-- Every row belongs to a user and is protected by RLS.
-- =============================================================

-- ---------- Enums ----------
create type public.txn_type as enum ('expense', 'income', 'refund', 'transfer');
create type public.category_kind as enum ('expense', 'income', 'transfer');

-- ---------- Shared helpers ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- profiles
-- =============================================================
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  currency     text not null default 'EUR',
  created_at   timestamptz not null default now()
);

-- =============================================================
-- categories
-- =============================================================
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(trim(name)) between 1 and 40),
  kind       public.category_kind not null,
  group_key  text not null default 'other'
             check (group_key in ('essentials','lifestyle','growth','giving','finance','income','transfers','other')),
  icon       text not null default 'tag',
  color      text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order int  not null default 0,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index categories_user_name_key on public.categories (user_id, lower(name));
create index categories_user_kind_idx on public.categories (user_id, kind, sort_order);

-- =============================================================
-- transactions
-- =============================================================
create table public.transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type           public.txn_type not null,
  amount_cents   bigint not null check (amount_cents > 0 and amount_cents < 100000000000),
  category_id    uuid not null,
  description    text check (description is null or length(description) <= 120),
  notes          text check (notes is null or length(notes) <= 1000),
  occurred_on    date not null default current_date,
  refund_of_id   uuid,
  payment_method text check (payment_method is null or payment_method in ('card','cash','bizum','bank_transfer')),
  -- reserved for future features
  recurring_id   uuid,
  source         text not null default 'manual',
  external_hash  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (id, user_id),
  constraint transactions_category_fk
    foreign key (category_id, user_id) references public.categories (id, user_id) on delete restrict,
  constraint transactions_refund_of_fk
    foreign key (refund_of_id, user_id) references public.transactions (id, user_id) on delete set null (refund_of_id),
  constraint transactions_refund_link_only_on_refunds
    check (refund_of_id is null or type = 'refund')
);

create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc, created_at desc);
create index transactions_user_category_date_idx on public.transactions (user_id, category_id, occurred_on);
create index transactions_refund_of_idx on public.transactions (refund_of_id) where refund_of_id is not null;
create unique index transactions_user_external_hash_key on public.transactions (user_id, external_hash)
  where external_hash is not null;

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Validates that the category kind matches the transaction type and
-- that linked refunds point to an expense and never exceed it.
create or replace function public.validate_transaction()
returns trigger
language plpgsql
as $$
declare
  v_kind           public.category_kind;
  v_orig           record;
  v_refunded_total bigint;
begin
  select kind into v_kind from public.categories where id = new.category_id;

  if v_kind is null then
    raise exception 'Category not found' using errcode = 'P0001';
  end if;

  if (new.type in ('expense', 'refund') and v_kind <> 'expense')
     or (new.type = 'income' and v_kind <> 'income')
     or (new.type = 'transfer' and v_kind <> 'transfer') then
    raise exception 'The category does not match the transaction type' using errcode = 'P0001';
  end if;

  if new.refund_of_id is not null then
    select id, type, amount_cents, category_id into v_orig
      from public.transactions where id = new.refund_of_id;

    if v_orig.id is null or v_orig.type <> 'expense' then
      raise exception 'A refund can only be linked to an expense' using errcode = 'P0001';
    end if;

    -- Linked refunds always share the category of the original expense
    new.category_id := v_orig.category_id;

    select coalesce(sum(amount_cents), 0) into v_refunded_total
      from public.transactions
      where refund_of_id = new.refund_of_id and id <> new.id;

    if v_refunded_total + new.amount_cents > v_orig.amount_cents then
      raise exception 'Refunds cannot exceed the original expense' using errcode = 'P0001';
    end if;
  end if;

  -- An expense cannot be reduced below what has already been refunded
  if tg_op = 'UPDATE' and new.type = 'expense' then
    select coalesce(sum(amount_cents), 0) into v_refunded_total
      from public.transactions where refund_of_id = new.id;
    if v_refunded_total > new.amount_cents then
      raise exception 'This expense has refunds larger than the new amount' using errcode = 'P0001';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.type = 'expense' and new.type <> 'expense'
     and exists (select 1 from public.transactions where refund_of_id = new.id) then
    raise exception 'This expense has linked refunds and must stay an expense' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger transactions_validate
  before insert or update on public.transactions
  for each row execute function public.validate_transaction();

-- Keep linked refunds in the same category when an expense changes category
create or replace function public.sync_refund_categories()
returns trigger
language plpgsql
as $$
begin
  if new.type = 'expense' and new.category_id <> old.category_id then
    update public.transactions
      set category_id = new.category_id
      where refund_of_id = new.id;
  end if;
  return new;
end;
$$;

create trigger transactions_sync_refund_categories
  after update of category_id on public.transactions
  for each row execute function public.sync_refund_categories();

-- =============================================================
-- budgets
--   category_id null => global budget
--   month null       => default for every month
-- =============================================================
create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id  uuid,
  month        date check (month is null or extract(day from month) = 1),
  amount_cents bigint not null check (amount_cents > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint budgets_category_fk
    foreign key (category_id, user_id) references public.categories (id, user_id) on delete cascade,
  constraint budgets_unique_scope unique nulls not distinct (user_id, category_id, month)
);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "categories_select_own" on public.categories
  for select using (user_id = auth.uid());
create policy "categories_insert_own" on public.categories
  for insert with check (user_id = auth.uid());
create policy "categories_update_own" on public.categories
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "categories_delete_own" on public.categories
  for delete using (user_id = auth.uid());

create policy "transactions_select_own" on public.transactions
  for select using (user_id = auth.uid());
create policy "transactions_insert_own" on public.transactions
  for insert with check (user_id = auth.uid());
create policy "transactions_update_own" on public.transactions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transactions_delete_own" on public.transactions
  for delete using (user_id = auth.uid());

create policy "budgets_select_own" on public.budgets
  for select using (user_id = auth.uid());
create policy "budgets_insert_own" on public.budgets
  for insert with check (user_id = auth.uid());
create policy "budgets_update_own" on public.budgets
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "budgets_delete_own" on public.budgets
  for delete using (user_id = auth.uid());

-- =============================================================
-- Delete a category, moving its transactions to another one.
-- Runs as the caller (security invoker) so RLS still applies.
-- =============================================================
create or replace function public.delete_category(p_id uuid, p_target_id uuid default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_source public.categories;
  v_target public.categories;
  v_count  int;
begin
  select * into v_source from public.categories where id = p_id and user_id = auth.uid();
  if v_source.id is null then
    raise exception 'Category not found' using errcode = 'P0001';
  end if;

  select count(*) into v_count from public.transactions where category_id = p_id;

  if v_count > 0 then
    if p_target_id is null then
      raise exception 'This category has transactions. Choose where to move them.' using errcode = 'P0001';
    end if;

    select * into v_target from public.categories where id = p_target_id and user_id = auth.uid();
    if v_target.id is null or v_target.id = v_source.id then
      raise exception 'Invalid target category' using errcode = 'P0001';
    end if;
    if v_target.kind <> v_source.kind then
      raise exception 'The target category must be of the same kind' using errcode = 'P0001';
    end if;

    -- Move expenses/income/transfers first, then refunds (their category follows the original expense)
    update public.transactions set category_id = p_target_id
      where category_id = p_id and refund_of_id is null;
    update public.transactions set category_id = p_target_id
      where category_id = p_id;

    -- Move category budgets only where the target has none for that month
    update public.budgets b set category_id = p_target_id
      where b.category_id = p_id
        and not exists (
          select 1 from public.budgets t
          where t.category_id = p_target_id and t.month is not distinct from b.month
        );
  end if;

  delete from public.categories where id = p_id;
end;
$$;

-- =============================================================
-- Default categories + profile on sign up
-- =============================================================
create or replace function public.seed_default_categories(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.categories (user_id, name, kind, group_key, icon, color, sort_order) values
    -- Essentials
    (p_user_id, 'Groceries',          'expense',  'essentials', 'shopping-cart',   '#eb6834', 10),
    (p_user_id, 'Housing',            'expense',  'essentials', 'house',           '#2a78d6', 11),
    (p_user_id, 'Transport',          'expense',  'essentials', 'bus',             '#1baf7a', 12),
    (p_user_id, 'Bills & Utilities',  'expense',  'essentials', 'receipt',         '#008300', 13),
    (p_user_id, 'Phone & Internet',   'expense',  'essentials', 'wifi',            '#5598e7', 14),
    (p_user_id, 'Health',             'expense',  'essentials', 'heart-pulse',     '#d55181', 15),
    (p_user_id, 'Insurance',          'expense',  'essentials', 'shield',          '#64748b', 16),
    -- Lifestyle
    (p_user_id, 'Restaurants',        'expense',  'lifestyle',  'utensils',        '#eda100', 20),
    (p_user_id, 'Coffee',             'expense',  'lifestyle',  'coffee',          '#a2582f', 21),
    (p_user_id, 'Entertainment',      'expense',  'lifestyle',  'ticket',          '#9085e9', 22),
    (p_user_id, 'Shopping',           'expense',  'lifestyle',  'shopping-bag',    '#4a3aa7', 23),
    (p_user_id, 'Subscriptions',      'expense',  'lifestyle',  'repeat',          '#e87ba4', 24),
    (p_user_id, 'Video Games',        'expense',  'lifestyle',  'gamepad-2',       '#6d28d9', 25),
    (p_user_id, 'Tech & Gadgets',     'expense',  'lifestyle',  'smartphone',      '#1c5cab', 26),
    (p_user_id, 'Travel',             'expense',  'lifestyle',  'plane',           '#e34948', 27),
    -- Growth
    (p_user_id, 'Courses',            'expense',  'growth',     'graduation-cap',  '#199e70', 30),
    (p_user_id, 'Books',              'expense',  'growth',     'book-open',       '#c98500', 31),
    (p_user_id, 'Software',           'expense',  'growth',     'code',            '#3949ab', 32),
    (p_user_id, 'Education',          'expense',  'growth',     'school',          '#0f766e', 33),
    (p_user_id, 'Gym & Sports',       'expense',  'growth',     'dumbbell',        '#0891b2', 34),
    -- Giving
    (p_user_id, 'Church',             'expense',  'giving',     'church',          '#7c3aed', 40),
    (p_user_id, 'Offerings',          'expense',  'giving',     'hand-heart',      '#be185d', 41),
    (p_user_id, 'Donations',          'expense',  'giving',     'heart-handshake', '#e66767', 42),
    (p_user_id, 'Gifts',              'expense',  'giving',     'gift',            '#db2777', 43),
    -- Finance
    (p_user_id, 'Debt',               'expense',  'finance',    'credit-card',     '#475569', 50),
    -- Income
    (p_user_id, 'Salary',             'income',   'income',     'briefcase',       '#16a34a', 60),
    (p_user_id, 'Freelance',          'income',   'income',     'laptop',          '#059669', 61),
    (p_user_id, 'Other income',       'income',   'income',     'circle-plus',     '#10b981', 62),
    -- Transfers
    (p_user_id, 'Savings',            'transfer', 'transfers',  'piggy-bank',      '#0891b2', 70),
    (p_user_id, 'Investments',        'transfer', 'transfers',  'trending-up',     '#0e7490', 71),
    (p_user_id, 'Between accounts',   'transfer', 'transfers',  'arrow-left-right','#64748b', 72),
    (p_user_id, 'Loans / IOUs',       'transfer', 'transfers',  'hand-coins',      '#94a3b8', 73)
  on conflict do nothing;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The seed function is only for the sign-up trigger
revoke execute on function public.seed_default_categories(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
