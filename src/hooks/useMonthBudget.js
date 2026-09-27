import { useData } from '../context/DataContext.jsx'
import { resolveBudget } from '../utils/finance.js'

/** Global budget for a month plus the raw default/override rows */
export function useMonthBudget(month) {
  const { budgets } = useData()
  const global = budgets.filter((b) => !b.category_id)
  return {
    amount: resolveBudget(budgets, month),
    defaultBudget: global.find((b) => !b.month) ?? null,
    override: global.find((b) => b.month?.startsWith(month)) ?? null,
  }
}
