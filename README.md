# Ledger

Personal finance app: log expenses in seconds from your phone and understand your monthly
income, spending, budget and savings.

**Stack:** React + JavaScript + Vite + Tailwind CSS v4 + Supabase (Postgres, Auth, RLS) + Recharts + Lucide.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of
   [`supabase/migrations/20260927000000_initial_schema.sql`](supabase/migrations/20260927000000_initial_schema.sql)
   and run it. This creates the tables, Row Level Security policies, validation triggers,
   the `delete_category` function and the default categories that are added to every new user.
3. In **Authentication → Sign In / Providers → Email**, decide whether you want email confirmation.
   If it's on, you'll need to click the link in the confirmation email after creating your account.
4. Copy your project URL and **anon/publishable** key from **Project Settings → API**.
   Never use the `service_role` key in the frontend.

## 2. Run locally

```bash
cp .env.example .env.local   # then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open the app, choose **Create one** on the login screen and create your account.

**After creating your account**, turn off **Allow new users to sign up** in
**Authentication → Sign In / Providers** so nobody else can register.

## 3. Deploy (Vercel)

1. Push this repo to GitHub and import it in [vercel.com](https://vercel.com) (framework: Vite).
2. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. `vercel.json` rewrites every route to `index.html` so deep links work.
4. In Supabase → **Authentication → URL Configuration**, set the **Site URL** to your Vercel URL.
5. On your iPhone, open the URL in Safari → Share → **Add to Home Screen**.

## Tests

```bash
npm test
```

Unit tests cover the financial formulas (`src/utils/finance.js`), money parsing and the keypad.

## How numbers are calculated

All amounts are stored as integer cents. For a month:

| Metric | Formula |
|---|---|
| Income | sum of `income` |
| Gross spending | sum of `expense` |
| Refunds | sum of `refund` |
| **Net spending** | gross spending − refunds |
| **Saved** | income − net spending |
| Savings rate | saved ÷ income (— when there is no income) |
| Budget used | net spending ÷ budget (month override, else the default budget) |

Transfers (Savings, Investments, Between accounts, Loans / IOUs) never count as income or spending.
A refund counts in the month of its own date. Linked refunds always share the category of their expense,
and the database rejects refunds larger than the original expense.

## Project structure

```
src/
  components/  layout, ui, transactions, dashboard, analytics, categories
  pages/       one file per route
  context/     auth, selected month, shared data (categories/budgets), toasts
  services/    Supabase calls only
  hooks/       data loading
  utils/       finance formulas, money and date helpers (+ tests)
  constants/   categories, icons, colours, copy
supabase/migrations/  database schema
```
