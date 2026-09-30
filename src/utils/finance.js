// Pure financial calculations. All amounts are integer cents.
// Transfers never count towards income, expenses or savings.

import { BUDGET_HIGH_PCT, BUDGET_NEAR_PCT } from '../constants/budgetThresholds.js'
import { monthKeyOf } from './dates.js'

/** Display sign of a transaction amount: -1 for money out, +1 for money in, 0 for neutral */
export function transactionSign(type) {
  if (type === 'expense') return -1
  if (type === 'income' || type === 'refund') return 1
  return 0
}

/**
 * Monthly summary.
 *   netExpense = grossExpense - refunds
 *   saved      = income - netExpense
 *   savingsRate = saved / income * 100 (null when there is no income)
 */
export function summarize(transactions) {
  let income = 0
  let grossExpense = 0
  let refunds = 0

  for (const t of transactions) {
    if (t.type === 'income') income += t.amount_cents
    else if (t.type === 'expense') grossExpense += t.amount_cents
    else if (t.type === 'refund') refunds += t.amount_cents
  }

  const netExpense = grossExpense - refunds
  const saved = income - netExpense
  const savingsRate = income > 0 ? (saved / income) * 100 : null

  return { income, grossExpense, refunds, netExpense, saved, savingsRate }
}

/** Map of categoryId -> { expense, refunds, net, count } for expenses and refunds */
export function netByCategory(transactions) {
  const map = new Map()
  for (const t of transactions) {
    if (t.type !== 'expense' && t.type !== 'refund') continue
    const entry = map.get(t.category_id) ?? { expense: 0, refunds: 0, net: 0, count: 0 }
    if (t.type === 'expense') {
      entry.expense += t.amount_cents
      entry.count += 1
    } else {
      entry.refunds += t.amount_cents
    }
    entry.net = entry.expense - entry.refunds
    map.set(t.category_id, entry)
  }
  return map
}

/**
 * Category breakdown for charts and lists, sorted by net spend (desc).
 * Negative nets (refund without expense in that month) are shown as 0 in the share.
 */
export function categoryBreakdown(transactions, categoriesById) {
  const nets = netByCategory(transactions)
  const rows = [...nets.entries()].map(([categoryId, v]) => ({
    categoryId,
    category: categoriesById.get(categoryId) ?? null,
    ...v,
  }))
  const positiveTotal = rows.reduce((sum, r) => sum + Math.max(r.net, 0), 0)
  return rows
    .map((r) => ({ ...r, share: positiveTotal > 0 ? (Math.max(r.net, 0) / positiveTotal) * 100 : 0 }))
    .sort((a, b) => b.net - a.net)
}

/**
 * Budget for a month: month-specific override, otherwise the default (month = null).
 * categoryId = null means the global budget. Returns cents or null.
 */
export function resolveBudget(budgets, monthKey, categoryId = null) {
  const scoped = budgets.filter((b) => (b.category_id ?? null) === categoryId)
  const override = scoped.find((b) => b.month && monthKeyOf(b.month) === monthKey)
  if (override) return override.amount_cents
  const fallback = scoped.find((b) => !b.month)
  return fallback ? fallback.amount_cents : null
}

/**
 * Budget usage.
 *   remaining = budget - spent
 *   usedPct   = spent / budget * 100
 * level: 'none' (no budget) | 'ok' | 'near' (>=70%) | 'high' (>=90%) | 'reached' (=100%) | 'over' (>100%)
 */
export function budgetStatus(spentCents, budgetCents) {
  if (!budgetCents) {
    return { budget: null, spent: spentCents, remaining: null, usedPct: null, level: 'none', overBy: 0 }
  }
  const remaining = budgetCents - spentCents
  const usedPct = (spentCents / budgetCents) * 100

  let level = 'ok'
  if (spentCents > budgetCents) level = 'over'
  else if (spentCents === budgetCents) level = 'reached'
  else if (usedPct >= BUDGET_HIGH_PCT) level = 'high'
  else if (usedPct >= BUDGET_NEAR_PCT) level = 'near'

  return {
    budget: budgetCents,
    spent: spentCents,
    remaining,
    usedPct,
    level,
    overBy: Math.max(-remaining, 0),
  }
}

/** Percentage change of net spending vs the previous month. Null when there is nothing to compare. */
export function percentChange(current, previous) {
  if (!previous || previous <= 0) return null
  return ((current - previous) / previous) * 100
}

/** Summaries per month for the given month keys (oldest first) */
export function summariesByMonth(transactions, monthKeys) {
  const groups = new Map(monthKeys.map((k) => [k, []]))
  for (const t of transactions) {
    const key = monthKeyOf(t.occurred_on)
    if (groups.has(key)) groups.get(key).push(t)
  }
  return monthKeys.map((month) => ({ month, ...summarize(groups.get(month)) }))
}

/**
 * Summaries for arbitrary date ranges (oldest first), e.g. calendar months or pay
 * cycles. Each range is `{ key, start, end }`; `key` just identifies it for charts.
 */
export function summariesByRange(transactions, ranges) {
  return ranges.map(({ key, start, end }) => ({
    key,
    start,
    end,
    ...summarize(transactions.filter((t) => t.occurred_on >= start && t.occurred_on <= end)),
  }))
}

/** Total refunded against a specific expense */
export function refundedFor(expenseId, transactions) {
  return transactions
    .filter((t) => t.type === 'refund' && t.refund_of_id === expenseId)
    .reduce((sum, t) => sum + t.amount_cents, 0)
}
