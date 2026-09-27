import { useData } from '../context/DataContext.jsx'
import { listTransactionsBetween } from '../services/transactions.js'
import { monthRange } from '../utils/dates.js'
import { useAsync } from './useAsync.js'

export function useMonthTransactions(month) {
  const { version } = useData()
  const { start, end } = monthRange(month)
  const result = useAsync(() => listTransactionsBetween(start, end), [start, end, version])
  return { ...result, transactions: result.data ?? [] }
}
