import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ReceiptText } from 'lucide-react'
import MonthSelector from '../components/layout/MonthSelector.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import TransactionFilters, { EMPTY_FILTERS, applyFilters } from '../components/transactions/TransactionFilters.jsx'
import TransactionList from '../components/transactions/TransactionList.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import SegmentedControl from '../components/ui/SegmentedControl.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { listTransactionsBetween } from '../services/transactions.js'
import { monthRange, shiftMonth } from '../utils/dates.js'
import { summarize } from '../utils/finance.js'
import { formatMoney } from '../utils/money.js'

const SCOPES = [
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All time' },
]

function rangeFor(scope, month) {
  if (scope === 'month') return monthRange(month)
  if (scope === 'year') return { start: `${month.slice(0, 4)}-01-01`, end: `${month.slice(0, 4)}-12-31` }
  return { start: '1900-01-01', end: '2999-12-31' }
}

export default function TransactionsPage() {
  const { month } = useMonth()
  const { categoriesById, version } = useData()
  const [scope, setScope] = useState('month')
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const { start, end } = rangeFor(scope, month)
  const { data, loading, error, reload } = useAsync(() => listTransactionsBetween(start, end), [start, end, version])

  const filtered = useMemo(() => applyFilters(data ?? [], filters, categoriesById), [data, filters, categoriesById])
  const totals = summarize(filtered)

  return (
    <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <PageHeader title="Transactions" />
        <div className="flex flex-col gap-3">
          <SegmentedControl options={SCOPES} value={scope} onChange={setScope} size="sm" />
          {scope !== 'all' && (scope === 'month' ? <MonthSelector /> : <YearLabel month={month} />)}
          <TransactionFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      <div className="mt-4 lg:mt-5">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Card className="px-4 py-3">
            <p className="text-xs text-muted">Money in</p>
            <p className="tabular text-base font-semibold text-positive">{formatMoney(totals.income + totals.refunds)}</p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-xs text-muted">Money out</p>
            <p className="tabular text-base font-semibold">{formatMoney(totals.grossExpense)}</p>
          </Card>
        </div>

        <Card className="p-2">
          {error ? (
            <ErrorNotice error={error} onRetry={reload} />
          ) : loading && !data ? (
            <Spinner />
          ) : filtered.length ? (
            <TransactionList transactions={filtered} />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title={data?.length ? 'No matching transactions' : 'No transactions yet'}
              message={data?.length ? 'Try changing the filters.' : 'Add your first transaction to start tracking.'}
              action={
                !data?.length && (
                  <Link to="/transactions/new" className="inline-flex items-center gap-1.5 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
                    <Plus size={16} /> Add transaction
                  </Link>
                )
              }
            />
          )}
        </Card>
        {filtered.length > 0 && (
          <p className="mt-3 text-center text-xs text-muted">
            {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  )
}

function YearLabel({ month }) {
  const { setMonth } = useMonth()
  const shift = (delta) => () => setMonth(shiftMonth(month, delta))
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-1 shadow-card">
      <button type="button" onClick={shift(-12)} className="h-9 rounded-xl px-3 text-sm text-muted hover:bg-subtle" aria-label="Previous year">
        ‹ {Number(month.slice(0, 4)) - 1}
      </button>
      <span className="text-sm font-semibold">{month.slice(0, 4)}</span>
      <button type="button" onClick={shift(12)} className="h-9 rounded-xl px-3 text-sm text-muted hover:bg-subtle" aria-label="Next year">
        {Number(month.slice(0, 4)) + 1} ›
      </button>
    </div>
  )
}
