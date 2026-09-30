import { TrendingDown, TrendingUp } from 'lucide-react'

/** "You spent 12% less than last month." */
export default function MonthComparison({ change, isCurrentMonth, periodLabel = 'month' }) {
  if (change == null) return null
  const rounded = Math.round(Math.abs(change))
  const less = change < 0
  const Icon = less ? TrendingDown : TrendingUp
  const subject = isCurrentMonth ? "So far you've spent" : 'You spent'
  const text =
    rounded === 0
      ? `${subject} about the same as the previous ${periodLabel}.`
      : `${subject} ${rounded}% ${less ? 'less' : 'more'} than the previous ${periodLabel}.`
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-[13px] shadow-card">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${less ? 'bg-positive-soft text-positive' : 'bg-negative-soft text-negative'}`}>
        <Icon size={16} />
      </span>
      <span className="text-ink-soft">{text}</span>
    </div>
  )
}
