import { formatMoney } from '../../utils/money.js'
import Card from '../ui/Card.jsx'

const LABEL = {
  month: 'Money left this month',
  'pay cycle': 'Money left since payday',
}

/**
 * The headline "how much do I actually have" figure: income (salary, other income,
 * gifts, loan repayments you logged as income...) minus net spending. Unlike the
 * budget card, this isn't a spending ceiling — it's your real net cash position,
 * so a windfall (a refund, a bonus) raises it immediately.
 */
export default function SavingsCard({ income, netExpense, saved, savingsRate, periodLabel = 'month' }) {
  const negative = saved < 0
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{LABEL[periodLabel] ?? `Money left this ${periodLabel}`}</p>
      <p className={`tabular mt-1 text-[34px] font-semibold leading-tight tracking-tight ${negative ? 'text-negative' : ''}`}>
        {formatMoney(saved)}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">Income</p>
          <p className="tabular text-[15px] font-semibold">{formatMoney(income)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Spent</p>
          <p className="tabular text-[15px] font-semibold">{formatMoney(netExpense)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Savings rate</p>
          <p className={`tabular text-[15px] font-semibold ${negative ? 'text-negative' : ''}`}>
            {savingsRate == null ? '—' : `${savingsRate.toFixed(1)}%`}
          </p>
        </div>
      </div>
    </Card>
  )
}
