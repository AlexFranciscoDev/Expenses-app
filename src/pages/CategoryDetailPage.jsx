import { useParams } from 'react-router-dom'
import CategoryIconBadge from '../components/categories/CategoryIconBadge.jsx'
import { BudgetAlert } from '../components/dashboard/BudgetSummaryCard.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PeriodSelector from '../components/layout/PeriodSelector.jsx'
import TransactionList from '../components/transactions/TransactionList.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { budgetTailNote } from '../constants/copy.js'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { listTransactionsForCategory } from '../services/transactions.js'
import { payCycleTailBeforeMonth } from '../utils/dates.js'
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
  const { payday, periodMode, range, rangeLabel } = useMonth()
  const { categoriesById, budgets, version } = useData()
  const category = categoriesById.get(id)
  const isCycle = periodMode === 'payday'
  const periodType = isCycle ? 'payday' : 'calendar'
  const periodKey = isCycle ? range.start : range.start.slice(0, 7)

  // In calendar mode, also fetch the pay-cycle "tail" (spent after payday, before this
  // month started) so it can still count against this category's limit.
  const tail = !isCycle && payday ? payCycleTailBeforeMonth(payday, periodKey) : null
  const fetchStart = tail ? tail.start : range.start
  const { data, loading, error, reload } = useAsync(
    () => listTransactionsForCategory(id, fetchStart, range.end),
    [id, fetchStart, range.end, version],
  )

  if (!category) {
    return (
      <>
        <PageHeader title="Category" back="/analytics" />
        <ErrorNotice error={{ message: 'Not found' }} />
      </>
    )
  }

  const allTransactions = data ?? []
  const transactions = tail ? allTransactions.filter((t) => t.occurred_on >= range.start) : allTransactions
  const totals = netByCategory(transactions).get(id) ?? { expense: 0, refunds: 0, net: 0 }
  const isExpense = category.kind === 'expense'
  const total = isExpense ? totals.net : transactions.reduce((s, t) => s + t.amount_cents, 0)
  const tailNet = tail ? (netByCategory(allTransactions).get(id)?.net ?? 0) - totals.net : 0
  const status = budgetStatus(totals.net + tailNet, resolveBudget(budgets, periodKey, id, periodType))
  const tailNote = budgetTailNote(tailNet, tail)

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={category.name} subtitle={rangeLabel} back />
      <PeriodSelector className="mb-4" />

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
            {tailNote && <p className="mt-2 text-[12px] text-muted">{tailNote}</p>}
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
          <EmptyState title="No transactions in this period" />
        )}
      </Card>
    </div>
  )
}
