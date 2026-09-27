import { formatMoney } from '../../utils/money.js'

function Line({ label, value, strong = false, tone = '' }) {
  return (
    <div className={`flex items-center justify-between py-2 ${strong ? 'font-semibold' : ''}`}>
      <span className={strong ? 'text-sm text-ink' : 'text-[13px] text-muted'}>{label}</span>
      <span className={`tabular text-sm ${tone}`}>{value}</span>
    </div>
  )
}

/** Monthly summary with the exact formulas used across the app */
export default function MonthSummaryTable({ summary }) {
  return (
    <div className="divide-y divide-line">
      <Line label="Income" value={formatMoney(summary.income)} />
      <Line label="Gross spending" value={formatMoney(summary.grossExpense)} />
      <Line label="Refunds" value={`−${formatMoney(summary.refunds)}`} tone="text-positive" />
      <Line label="Net spending" value={formatMoney(summary.netExpense)} strong />
      <Line label="Saved" value={formatMoney(summary.saved)} strong tone={summary.saved < 0 ? 'text-negative' : 'text-positive'} />
      <Line label="Savings rate" value={summary.savingsRate == null ? '—' : `${summary.savingsRate.toFixed(1)}%`} />
    </div>
  )
}
