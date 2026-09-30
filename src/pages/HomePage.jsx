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
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useMonthBudget } from '../hooks/useMonthBudget.js'
import { usePeriodSummaries } from '../hooks/usePeriodSummaries.js'
import { budgetStatus, categoryBreakdown, percentChange, resolveBudget } from '../utils/finance.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 19) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { month, periodMode, isCurrentPeriod, range } = useMonth()
  const { profile, categoriesById, budgets } = useData()

  const isCycle = periodMode === 'payday'
  const periodType = isCycle ? 'payday' : 'calendar'
  const periodKey = isCycle ? range.start : month
  const periodLabel = isCycle ? 'pay cycle' : 'month'
  const subject = isCycle ? 'your pay-cycle budget' : undefined

  const { amount: budget } = useMonthBudget(periodKey, null, periodType)
  const { summaries, periodTransactions, loading, error, reload, data } = usePeriodSummaries(2)

  const [previous, current] = summaries
  const status = current ? budgetStatus(current.netExpense, budget) : null
  const breakdown = useMemo(() => categoryBreakdown(periodTransactions, categoriesById), [periodTransactions, categoriesById])
  const categoryAlerts = useMemo(
    () =>
      breakdown
        .filter((r) => r.category)
        .map((r) => ({
          category: r.category,
          status: budgetStatus(r.net, resolveBudget(budgets, periodKey, r.categoryId, periodType)),
        }))
        .filter((r) => ['near', 'high', 'reached', 'over'].includes(r.status.level)),
    [breakdown, budgets, periodKey, periodType],
  )

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <header className="flex items-center justify-between pb-4 pt-5 lg:pt-4">
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft hover:bg-subtle lg:hidden"
        >
          <Settings size={18} />
        </Link>
      </header>

      <PeriodSelector className="mb-4 lg:max-w-md" />

      {error ? (
        <ErrorNotice error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner className="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="flex flex-col gap-4">
            <BudgetSummaryCard status={status} income={current.income} netExpense={current.netExpense} periodLabel={periodLabel} subject={subject} />
            <CategoryBudgetAlerts rows={categoryAlerts} />
            <SavingsCard saved={current.saved} savingsRate={current.savingsRate} />
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
