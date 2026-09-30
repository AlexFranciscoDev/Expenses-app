import { useParams } from 'react-router-dom'
import CategoryIconBadge from '../components/categories/CategoryIconBadge.jsx'
import { BudgetAlert } from '../components/dashboard/BudgetSummaryCard.jsx'
import MonthSelector from '../components/layout/MonthSelector.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import TransactionList from '../components/transactions/TransactionList.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { listTransactionsForCategory } from '../services/transactions.js'
import { formatMonth, monthRange } from '../utils/dates.js'
import { budgetStatus, netByCategory, resolveBudget } from '../utils/finance.js'
import { formatMoney } from '../utils/money.js'

function Stat({ label, value, tone = '' }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`tabular text-[15px] font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

export default function CategoryDetailPage() {
  const { id } = useParams()
  const { month } = useMonth()
  const { categoriesById, budgets, version } = useData()
  const category = categoriesById.get(id)
  const { start, end } = monthRange(month)
  const { data, loading, error, reload } = useAsync(() => listTransactionsForCategory(id, start, end), [id, start, end, version])

  if (!category) {
    return (
      <>
        <PageHeader title="Category" back="/analytics" />
        <ErrorNotice error={{ message: 'Not found' }} />
      </>
    )
  }

  const transactions = data ?? []
  const totals = netByCategory(transactions).get(id) ?? { expense: 0, refunds: 0, net: 0 }
  const isExpense = category.kind === 'expense'
  const total = isExpense ? totals.net : transactions.reduce((s, t) => s + t.amount_cents, 0)
  const status = budgetStatus(totals.net, resolveBudget(budgets, month, id))

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={category.name} subtitle={formatMonth(month)} back />
      <MonthSelector className="mb-4" />

      <Card className="mb-4 p-5">
        <div className="mb-4 flex items-center gap-3">
          <CategoryIconBadge category={category} size="lg" />
          <div>
            <p className="text-xs text-muted">{isExpense ? 'Spent' : category.kind === 'income' ? 'Received' : 'Moved'}</p>
            <p className="tabular text-2xl font-semibold tracking-tight">{formatMoney(total)}</p>
          </div>
        </div>
        {isExpense && (
          <div className="grid grid-cols-3 gap-3 border-t border-line pt-4">
            <Stat label="Gross" value={formatMoney(totals.expense)} />
            <Stat label="Refunded" value={formatMoney(totals.refunds)} tone="text-positive" />
            {status.level === 'none' ? (
              <Stat label="Budget" value="—" />
            ) : (
              <Stat label="Remaining" value={formatMoney(status.remaining)} tone={status.remaining < 0 ? 'text-negative' : ''} />
            )}
          </div>
        )}
        {isExpense && status.level !== 'none' && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span>
                {formatMoney(status.spent)} of {formatMoney(status.budget)}
              </span>
              <span className="tabular font-semibold">{Math.round(status.usedPct)}%</span>
            </div>
            <ProgressBar value={status.usedPct} tone={status.level === 'over' ? 'negative' : status.level === 'ok' ? 'brand' : 'warning'} />
            <BudgetAlert status={status} subject={`your ${category.name} limit`} />
          </div>
        )}
      </Card>

      <Card className="p-2">
        {error ? (
          <ErrorNotice error={error} onRetry={reload} />
        ) : loading && !data ? (
          <Spinner />
        ) : transactions.length ? (
          <TransactionList transactions={transactions} />
        ) : (
          <EmptyState title="No transactions this month" />
        )}
      </Card>
    </div>
  )
}
