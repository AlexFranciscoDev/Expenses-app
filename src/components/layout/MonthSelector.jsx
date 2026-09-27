import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonth } from '../../context/MonthContext.jsx'
import { formatMonth, shiftMonth } from '../../utils/dates.js'

export default function MonthSelector({ className = '' }) {
  const { month, goPrev, goNext, goToday, isCurrentMonth } = useMonth()
  return (
    <div className={`flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-1 shadow-card ${className}`}>
      <button
        type="button"
        onClick={goPrev}
        aria-label={`Previous month (${formatMonth(shiftMonth(month, -1))})`}
        className="flex h-9 items-center gap-1 rounded-xl px-2.5 text-[13px] font-medium text-muted hover:bg-subtle hover:text-ink"
      >
        <ChevronLeft size={16} />
        <span className="hidden min-[380px]:inline">{formatMonth(shiftMonth(month, -1), 'short')}</span>
      </button>
      <button
        type="button"
        onClick={goToday}
        title={isCurrentMonth ? undefined : 'Back to current month'}
        className="flex-1 truncate text-center text-sm font-semibold"
      >
        {formatMonth(month)}
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label={`Next month (${formatMonth(shiftMonth(month, 1))})`}
        className="flex h-9 items-center gap-1 rounded-xl px-2.5 text-[13px] font-medium text-muted hover:bg-subtle hover:text-ink"
      >
        <span className="hidden min-[380px]:inline">{formatMonth(shiftMonth(month, 1), 'short')}</span>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
