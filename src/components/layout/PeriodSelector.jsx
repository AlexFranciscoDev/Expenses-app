import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMonth } from '../../context/MonthContext.jsx'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import MonthSelector from './MonthSelector.jsx'

const MODES = [
  { key: 'calendar', label: 'Calendar month' },
  { key: 'payday', label: 'Pay cycle' },
]

/**
 * Drop-in replacement for MonthSelector on pages that also support the pay-cycle
 * view (Home, Transactions, Analytics). Shows a plain MonthSelector, unchanged,
 * until the user sets a payday in Settings.
 */
export default function PeriodSelector({ className = '' }) {
  const { payday, periodMode, setPeriodMode, rangeLabel, goPrevCycle, goNextCycle, goCurrentCycle } = useMonth()

  if (!payday) {
    return (
      <div className={className}>
        <MonthSelector />
        <Link to="/settings" className="mt-2 block text-center text-[12px] text-muted hover:text-brand">
          Set your payday to also see this by pay cycle
        </Link>
      </div>
    )
  }

  return (
    <div className={className}>
      <SegmentedControl options={MODES} value={periodMode} onChange={setPeriodMode} size="sm" className="mb-2" />
      {periodMode === 'payday' ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-1 shadow-card">
          <button
            type="button"
            onClick={goPrevCycle}
            aria-label="Previous pay cycle"
            className="flex h-9 items-center rounded-xl px-2.5 text-muted hover:bg-subtle hover:text-ink"
          >
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={goCurrentCycle} className="flex-1 truncate text-center text-sm font-semibold">
            {rangeLabel}
          </button>
          <button
            type="button"
            onClick={goNextCycle}
            aria-label="Next pay cycle"
            className="flex h-9 items-center rounded-xl px-2.5 text-muted hover:bg-subtle hover:text-ink"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <MonthSelector />
      )}
    </div>
  )
}
