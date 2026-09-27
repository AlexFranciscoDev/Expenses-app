import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { listTransactionsBetween } from '../services/transactions.js'
import { lastMonths, monthKeyOf, monthRange } from '../utils/dates.js'
import { summariesByMonth } from '../utils/finance.js'
import { useAsync } from './useAsync.js'

/**
 * Loads the `count` months ending at `month` in a single request.
 * Returns per-month summaries (oldest first) and the selected month's transactions.
 */
export function useMonthlySummaries(month, count = 6) {
  const { version } = useData()
  const months = useMemo(() => lastMonths(month, count), [month, count])
  const start = monthRange(months[0]).start
  const end = monthRange(month).end
  const result = useAsync(() => listTransactionsBetween(start, end), [start, end, version])

  const summaries = useMemo(() => (result.data ? summariesByMonth(result.data, months) : []), [result.data, months])
  const monthTransactions = useMemo(
    () => (result.data ?? []).filter((t) => monthKeyOf(t.occurred_on) === month),
    [result.data, month],
  )
  return { ...result, summaries, monthTransactions }
}
