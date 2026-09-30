import { useData } from '../context/DataContext.jsx'
import { monthKeyOf } from '../utils/dates.js'
import { resolveBudget } from '../utils/finance.js'

/**
 * Budget for a period plus the raw default/override rows. categoryId = null is the global
 * budget. `periodKey` is a "YYYY-MM" month for periodType 'calendar', or a cycle's start
 * date "YYYY-MM-DD" for 'payday' — calendar and pay-cycle budgets are independent.
 */
export function useMonthBudget(periodKey, categoryId = null, periodType = 'calendar') {
  const { budgets } = useData()
  const scoped = budgets.filter((b) => (b.category_id ?? null) === categoryId && (b.period_type ?? 'calendar') === periodType)
  const matchesOverride = (b) => b.month && (periodType === 'calendar' ? monthKeyOf(b.month) === periodKey : b.month === periodKey)
  return {
    amount: resolveBudget(budgets, periodKey, categoryId, periodType),
    defaultBudget: scoped.find((b) => !b.month) ?? null,
    override: scoped.find(matchesOverride) ?? null,
  }
}

/** All categoryIds that have at least one budget row (default or an override) of the given period type */
export function useBudgetedCategoryIds(periodType = 'calendar') {
  const { budgets } = useData()
  return [...new Set(budgets.filter((b) => b.category_id && (b.period_type ?? 'calendar') === periodType).map((b) => b.category_id))]
}
