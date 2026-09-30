import { useData } from '../context/DataContext.jsx'
import { resolveBudget } from '../utils/finance.js'

/** Budget for a month plus the raw default/override rows. categoryId = null is the global budget. */
export function useMonthBudget(month, categoryId = null) {
  const { budgets } = useData()
  const scoped = budgets.filter((b) => (b.category_id ?? null) === categoryId)
  return {
    amount: resolveBudget(budgets, month, categoryId),
    defaultBudget: scoped.find((b) => !b.month) ?? null,
    override: scoped.find((b) => b.month?.startsWith(month)) ?? null,
  }
}

/** All categoryIds that have at least one budget row (default or a monthly override) */
export function useBudgetedCategoryIds() {
  const { budgets } = useData()
  return [...new Set(budgets.filter((b) => b.category_id).map((b) => b.category_id))]
}
