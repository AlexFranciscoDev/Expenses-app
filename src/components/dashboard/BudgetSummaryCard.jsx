import { Link } from 'react-router-dom'
import { ChevronRight, Info, TriangleAlert } from 'lucide-react'
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

/**
 * Secondary, spending-limit-focused card. The headline "how much money do I
 * actually have" figure lives in SavingsCard now — this is just the budget ceiling.
 */
export default function BudgetSummaryCard({ status, periodLabel = 'month', subject, tailNote }) {
  const hasBudget = status.level !== 'none'
  const over = status.level === 'over'

  if (!hasBudget) {
    return (
      <Link
        to="/budgets"
        className="flex items-center justify-between rounded-card border border-dashed border-line bg-surface px-4 py-3.5 text-[13px] font-semibold text-brand hover:bg-brand-soft"
      >
        Set a {periodLabel === 'month' ? 'monthly' : 'pay-cycle'} budget
        <ChevronRight size={16} />
      </Link>
    )
  }

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{over ? 'Over budget' : 'Budget left'}</p>
      <p className={`tabular mt-1 text-[28px] font-semibold leading-tight tracking-tight ${over ? 'text-negative' : ''}`}>
        {formatMoney(over ? status.overBy : status.remaining)}
      </p>

      <div className="mt-3">
        <div className="mb-2 flex items-baseline justify-between text-xs">
          <span className="text-muted">
            <span className="tabular font-semibold text-ink">{formatMoney(status.spent)}</span> of {formatMoney(status.budget)}
          </span>
          <span className={`tabular font-semibold ${over ? 'text-negative' : 'text-ink-soft'}`}>{Math.round(status.usedPct)}%</span>
        </div>
        <ProgressBar value={status.usedPct} tone={BAR_TONE[status.level]} />
        {tailNote && <p className="mt-2 text-[12px] text-muted">{tailNote}</p>}
        <BudgetAlert status={status} subject={subject} />
      </div>
    </Card>
  )
}
