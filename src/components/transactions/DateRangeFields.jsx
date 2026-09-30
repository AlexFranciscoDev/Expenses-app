import { CalendarDays } from 'lucide-react'
import { useNativeDatePicker } from '../../hooks/useNativeDatePicker.js'
import { formatShortDate, todayISO } from '../../utils/dates.js'

/** Two chips ("from" / "to") that each open the native calendar via a hidden date input. */
export default function DateRangeFields({ start, end, onChange }) {
  const from = useNativeDatePicker()
  const to = useNativeDatePicker()
  const max = todayISO()

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-1 shadow-card">
      <button
        type="button"
        onClick={from.open}
        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold text-ink-soft hover:bg-subtle"
      >
        <CalendarDays size={14} />
        {formatShortDate(start)}
        <input
          ref={from.ref}
          type="date"
          aria-label="Start date"
          value={start}
          max={end}
          onChange={(e) => e.target.value && onChange({ start: e.target.value, end })}
          className="sr-only"
        />
      </button>
      <span className="text-xs text-muted">to</span>
      <button
        type="button"
        onClick={to.open}
        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold text-ink-soft hover:bg-subtle"
      >
        <CalendarDays size={14} />
        {formatShortDate(end)}
        <input
          ref={to.ref}
          type="date"
          aria-label="End date"
          value={end}
          min={start}
          max={max}
          onChange={(e) => e.target.value && onChange({ start, end: e.target.value })}
          className="sr-only"
        />
      </button>
    </div>
  )
}
