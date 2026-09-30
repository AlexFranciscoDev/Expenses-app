import { Link } from 'react-router-dom'
import { Info, TriangleAlert } from 'lucide-react'
import { BUDGET_MESSAGES } from '../../constants/copy.js'
import { formatMoney } from '../../utils/money.js'
import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

const BAR_TONE = { ok: 'brand', near: 'warning', high: 'warning', reached: 'warning', over: 'negative' }

export function BudgetAlert({ status, subject }) {
  if (!['near', 'high', 'reached', 'over'].includes(status.level)) return null
  const message =
    status.level === 'over'
      ? BUDGET_MESSAGES.over(status.overBy, subject)
      : status.level === 'high'
        ? BUDGET_MESSAGES.high(status.usedPct, subject)
        : BUDGET_MESSAGES[status.level](subject)
  const over = status.level === 'over'
  const Icon = over ? TriangleAlert : Info
  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-medium ${
        over ? 'bg-negative-soft text-negative' : 'bg-warning-soft text-warning'
      }`}
    >
      <Icon size={15} className="mt-px shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default function BudgetSummaryCard({ status, income, netExpense, periodLabel = 'month', subject }) {
  const hasBudget = status.level !== 'none'
  const over = status.level === 'over'

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {over ? 'Over budget' : hasBudget ? 'Budget left' : `Spent this ${periodLabel}`}
      </p>
      <p className={`tabular mt-1 text-[34px] font-semibold leading-tight tracking-tight ${over ? 'text-negative' : ''}`}>
        {hasBudget ? formatMoney(over ? status.overBy : status.remaining) : formatMoney(netExpense)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">Income</p>
          <p className="tabular text-[15px] font-semibold">{formatMoney(income)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Net spending</p>
          <p className="tabular text-[15px] font-semibold">{formatMoney(netExpense)}</p>
        </div>
      </div>

      {hasBudget ? (
        <div className="mt-4">
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="text-muted">
              <span className="tabular font-semibold text-ink">{formatMoney(status.spent)}</span> of {formatMoney(status.budget)}
            </span>
            <span className={`tabular font-semibold ${over ? 'text-negative' : 'text-ink-soft'}`}>{Math.round(status.usedPct)}%</span>
          </div>
          <ProgressBar value={status.usedPct} tone={BAR_TONE[status.level]} />
          <BudgetAlert status={status} subject={subject} />
        </div>
      ) : (
        <Link to="/budgets" className="mt-4 block rounded-2xl bg-brand-soft px-3 py-2.5 text-center text-[13px] font-semibold text-brand">
          Set a {periodLabel === 'month' ? 'monthly' : 'pay-cycle'} budget
        </Link>
      )}
    </Card>
  )
}
