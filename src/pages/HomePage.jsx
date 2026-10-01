import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import BudgetSummaryCard from '../components/dashboard/BudgetSummaryCard.jsx'
import CategoryBudgetAlerts from '../components/dashboard/CategoryBudgetAlerts.jsx'
import MonthComparison from '../components/dashboard/MonthComparison.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import SavingsCard from '../components/dashboard/SavingsCard.jsx'
import TopCategories from '../components/dashboard/TopCategories.jsx'
import PeriodSelector from '../components/layout/PeriodSelector.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { budgetTailNote } from '../constants/copy.js'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useBudgetedCategoryIds, useMonthBudget } from '../hooks/useMonthBudget.js'
import { usePeriodSummaries } from '../hooks/usePeriodSummaries.js'
import { payCycleTailBeforeMonth } from '../utils/dates.js'
import {
  budgetedTransferAmount,
  budgetStatus,
  categoryBreakdown,
  netByCategory,
  netExpenseInRange,
  percentChange,
  resolveBudget,
} from '../utils/finance.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 19) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { month, payday, periodMode, isCurrentPeriod, range } = useMonth()
  const { profile, categoriesById, budgets } = useData()

  const isCycle = periodMode === 'payday'
  const periodType = isCycle ? 'payday' : 'calendar'
  const periodKey = isCycle ? range.start : month
  const periodLabel = isCycle ? 'pay cycle' : 'month'
  const subject = isCycle ? 'your pay-cycle budget' : undefined

  const { amount: budget } = useMonthBudget(periodKey, null, periodType)
  const budgetedCategoryIds = useBudgetedCategoryIds(periodType)
  const { summaries, periodTransactions, loading, error, reload, data } = usePeriodSummaries(2)

  const [previous, current] = summaries

  // In calendar mode, money spent after payday but before this month started already
  // came out of this paycheck — it still counts against this month's (and its
  // categories') budget, even though it falls outside this calendar month's own data.
  const tail = !isCycle && payday ? payCycleTailBeforeMonth(payday, month) : null
  const tailTransactions = useMemo(
    () => (tail ? (data ?? []).filter((t) => t.occurred_on >= tail.start && t.occurred_on <= tail.end) : []),
    [data, tail],
  )
  const tailNet = netExpenseInRange(data ?? [], tail)
  // Savings/Investments transfers reduce the GLOBAL budget (they're still money leaving
  // this period's spending power) — but never Income/Net spending/Saved, and never a
  // category limit.
  const budgetTransfers = useMemo(
    () => budgetedTransferAmount([...periodTransactions, ...tailTransactions], categoriesById),
    [periodTransactions, tailTransactions, categoriesById],
  )
  const status = current ? budgetStatus(current.netExpense + tailNet + budgetTransfers, budget) : null
  const tailNote = budgetTailNote(tailNet, tail)

  const breakdown = useMemo(() => categoryBreakdown(periodTransactions, categoriesById), [periodTransactions, categoriesById])
  // Driven by which categories actually have a limit — not by `breakdown`, which would
  // miss a category whose only spending this period is in the tail (0 this month so far).
  const budgetNets = useMemo(() => netByCategory([...periodTransactions, ...tailTransactions]), [periodTransactions, tailTransactions])
  const categoryAlerts = useMemo(
    () =>
      budgetedCategoryIds
        .map((id) => categoriesById.get(id))
        .filter(Boolean)
        .map((category) => ({
          category,
          status: budgetStatus(budgetNets.get(category.id)?.net ?? 0, resolveBudget(budgets, periodKey, category.id, periodType)),
        }))
        .filter((r) => ['near', 'high', 'reached', 'over'].includes(r.status.level)),
    [budgetedCategoryIds, budgetNets, categoriesById, budgets, periodKey, periodType],
  )

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <header className="flex items-center justify-between pb-4 pt-5 xl:pt-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {greeting()}
            {profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-[13px] text-muted">{today}</p>
        </div>
        <Link
          to="/settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft hover:bg-subtle xl:hidden"
        >
          <Settings size={18} />
        </Link>
      </header>

      <PeriodSelector className="mb-4 xl:max-w-md" />

      {error ? (
        <ErrorNotice error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner className="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-6">
          <div className="flex flex-col gap-4">
            <SavingsCard
              income={current.income}
              netExpense={current.netExpense}
              saved={current.saved}
              savingsRate={current.savingsRate}
              periodLabel={periodLabel}
            />
            <BudgetSummaryCard status={status} periodLabel={periodLabel} subject={subject} tailNote={tailNote} />
            <CategoryBudgetAlerts rows={categoryAlerts} />
            <MonthComparison change={percentChange(current.netExpense, previous.netExpense)} isCurrentMonth={isCurrentPeriod} periodLabel={periodLabel} />
          </div>
          <div className="flex flex-col gap-4">
            <TopCategories rows={breakdown} />
            <RecentActivity transactions={periodTransactions} />
          </div>
        </div>
      )}
    </>
  )
}
