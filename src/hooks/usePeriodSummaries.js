import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { listTransactionsBetween } from '../services/transactions.js'
import { lastMonths, monthRange, payCycleRange } from '../utils/dates.js'
import { summariesByRange } from '../utils/finance.js'
import { useAsync } from './useAsync.js'

/**
 * Summaries for the `count` periods ending at the active one (oldest first) — calendar
 * months or pay cycles, whichever mode MonthContext is in — plus the active period's
 * own transactions. A single request covers the whole span.
 */
export function usePeriodSummaries(count = 6) {
  const { version } = useData()
  const { month, periodMode, payday, cycleOffset } = useMonth()

  const ranges = useMemo(() => {
    if (periodMode === 'payday' && payday) {
      return Array.from({ length: count }, (_, i) => {
        const offset = cycleOffset - (count - 1 - i)
        return { key: `cycle-${offset}`, ...payCycleRange(payday, offset) }
      })
    }
    return lastMonths(month, count).map((m) => ({ key: m, ...monthRange(m) }))
  }, [periodMode, payday, cycleOffset, month, count])

  const start = ranges[0].start
  const end = ranges[ranges.length - 1].end
  const result = useAsync(() => listTransactionsBetween(start, end), [start, end, version])

  const summaries = useMemo(() => (result.data ? summariesByRange(result.data, ranges) : []), [result.data, ranges])

  const activeRange = ranges[ranges.length - 1]
  const periodTransactions = useMemo(
    () => (result.data ?? []).filter((t) => t.occurred_on >= activeRange.start && t.occurred_on <= activeRange.end),
    [result.data, activeRange],
  )

  return { ...result, summaries, periodTransactions, activeRange }
}
