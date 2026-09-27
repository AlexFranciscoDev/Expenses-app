import { useMemo } from 'react'
import { ChartPie } from 'lucide-react'
import CategoryBreakdownList from '../components/analytics/CategoryBreakdownList.jsx'
import CategoryDonut from '../components/analytics/CategoryDonut.jsx'
import MonthSummaryTable from '../components/analytics/MonthSummaryTable.jsx'
import MonthlyBarChart from '../components/analytics/MonthlyBarChart.jsx'
import MonthComparison from '../components/dashboard/MonthComparison.jsx'
import MonthSelector from '../components/layout/MonthSelector.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useMonthlySummaries } from '../hooks/useMonthlySummaries.js'
import { categoryBreakdown, percentChange } from '../utils/finance.js'

export default function AnalyticsPage() {
  const { month, isCurrentMonth } = useMonth()
  const { categoriesById } = useData()
  const { summaries, monthTransactions, loading, error, reload, data } = useMonthlySummaries(month, 6)

  const rows = useMemo(() => categoryBreakdown(monthTransactions, categoriesById), [monthTransactions, categoriesById])
  const current = summaries[summaries.length - 1]
  const previous = summaries[summaries.length - 2]

  return (
    <>
      <PageHeader title="Analytics" />
      <MonthSelector className="mb-4 lg:max-w-md" />

      {error ? (
        <ErrorNotice error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner className="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
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
              <EmptyState icon={ChartPie} title="No spending this month" message="Your categories will appear here once you add expenses." />
            )}
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-4">
              <h2 className="mb-3 text-[15px] font-semibold">Monthly spending</h2>
              <MonthlyBarChart summaries={summaries} selectedMonth={month} />
            </Card>
            <MonthComparison change={percentChange(current.netExpense, previous?.netExpense)} isCurrentMonth={isCurrentMonth} />
            <Card className="px-4 py-2">
              <MonthSummaryTable summary={current} />
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
