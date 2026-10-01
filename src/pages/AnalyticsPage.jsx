import { useMemo } from 'react'
import { ChartPie } from 'lucide-react'
import CategoryBreakdownList from '../components/analytics/CategoryBreakdownList.jsx'
import CategoryDonut from '../components/analytics/CategoryDonut.jsx'
import MonthSummaryTable from '../components/analytics/MonthSummaryTable.jsx'
import MonthlyBarChart from '../components/analytics/MonthlyBarChart.jsx'
import MonthComparison from '../components/dashboard/MonthComparison.jsx'
import PeriodSelector from '../components/layout/PeriodSelector.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { usePeriodSummaries } from '../hooks/usePeriodSummaries.js'
import { formatDayMonth, formatMonth } from '../utils/dates.js'
import { categoryBreakdown, percentChange } from '../utils/finance.js'

export default function AnalyticsPage() {
  const { periodMode, isCurrentPeriod } = useMonth()
  const { categoriesById } = useData()
  const { summaries, periodTransactions, activeRange, loading, error, reload, data } = usePeriodSummaries(6)

  const rows = useMemo(() => categoryBreakdown(periodTransactions, categoriesById), [periodTransactions, categoriesById])
  const current = summaries[summaries.length - 1]
  const previous = summaries[summaries.length - 2]
  const isCycle = periodMode === 'payday'
  const labelFor = isCycle ? (s) => formatDayMonth(s.start) : (s) => formatMonth(s.key, 'short')

  return (
    <>
      <PeriodSelector className="mb-4 xl:max-w-md" />

      {error ? (
        <ErrorNotice error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner className="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-6">
          <Card className="p-4">
            <h2 className="mb-4 text-[15px] font-semibold">Spending by category</h2>
            {rows.length ? (
              <>
                <CategoryDonut rows={rows} total={current.netExpense} />
                <div className="-mx-2 mt-5">
                  <CategoryBreakdownList rows={rows} />
                </div>
              </>
            ) : (
              <EmptyState icon={ChartPie} title="No spending in this period" message="Your categories will appear here once you add expenses." />
            )}
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-4">
              <h2 className="mb-3 text-[15px] font-semibold">{isCycle ? 'Spending by pay cycle' : 'Monthly spending'}</h2>
              <MonthlyBarChart summaries={summaries} selectedKey={activeRange.key} labelFor={labelFor} />
            </Card>
            <MonthComparison
              change={percentChange(current.netExpense, previous?.netExpense)}
              isCurrentMonth={isCurrentPeriod}
              periodLabel={isCycle ? 'pay cycle' : 'month'}
            />
            <Card className="px-4 py-2">
              <MonthSummaryTable summary={current} />
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
