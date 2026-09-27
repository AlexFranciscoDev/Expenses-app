import { PiggyBank } from 'lucide-react'
import { formatMoney } from '../../utils/money.js'
import Card from '../ui/Card.jsx'

export default function SavingsCard({ saved, savingsRate }) {
  const negative = saved < 0
  return (
    <Card className="flex items-center gap-4 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${negative ? 'bg-negative-soft text-negative' : 'bg-positive-soft text-positive'}`}>
        <PiggyBank size={19} />
      </span>
      <div className="flex-1">
        <p className="text-xs text-muted">{negative ? 'Spent more than earned' : 'Saved this month'}</p>
        <p className={`tabular text-[17px] font-semibold ${negative ? 'text-negative' : ''}`}>{formatMoney(saved)}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted">Savings rate</p>
        <p className={`tabular text-[17px] font-semibold ${negative ? 'text-negative' : 'text-positive'}`}>
          {savingsRate == null ? '—' : `${savingsRate.toFixed(1)}%`}
        </p>
      </div>
    </Card>
  )
}
