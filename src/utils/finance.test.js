import { describe, expect, it } from 'vitest'
import {
  budgetStatus,
  categoryBreakdown,
  netByCategory,
  percentChange,
  refundedFor,
  resolveBudget,
  summarize,
  summariesByMonth,
  summariesByRange,
  transactionSign,
} from './finance.js'

const tx = (type, amount_cents, category_id = 'food', extra = {}) => ({
  id: Math.random().toString(36).slice(2),
  type,
  amount_cents,
  category_id,
  occurred_on: '2026-09-15',
  ...extra,
})

describe('summarize', () => {
  it('computes the example from the spec', () => {
    const s = summarize([
      tx('income', 150000, 'salary'),
      tx('expense', 90000),
      tx('refund', 5000),
    ])
    expect(s).toMatchObject({ income: 150000, grossExpense: 90000, refunds: 5000, netExpense: 85000, saved: 65000 })
    expect(s.savingsRate).toBeCloseTo(43.33, 2)
  })

  it('ignores transfers', () => {
    const s = summarize([tx('income', 100000, 'salary'), tx('transfer', 50000, 'savings'), tx('expense', 20000)])
    expect(s).toMatchObject({ income: 100000, netExpense: 20000, saved: 80000 })
  })

  it('returns null savings rate without income and allows negative savings', () => {
    const s = summarize([tx('expense', 1000)])
    expect(s.savingsRate).toBeNull()
    expect(s.saved).toBe(-1000)
  })

  it('handles an empty month', () => {
    expect(summarize([])).toEqual({ income: 0, grossExpense: 0, refunds: 0, netExpense: 0, saved: 0, savingsRate: null })
  })
})

describe('refunds by category', () => {
  it('restaurant 60 - refund 20 = 40', () => {
    const dinner = tx('expense', 6000, 'restaurants')
    const list = [dinner, tx('refund', 2000, 'restaurants', { refund_of_id: dinner.id })]
    expect(netByCategory(list).get('restaurants')).toEqual({ expense: 6000, refunds: 2000, net: 4000, count: 1 })
    expect(refundedFor(dinner.id, list)).toBe(2000)
  })

  it('breakdown clamps negative nets to 0% share and sorts by net', () => {
    const cats = new Map([['a', { name: 'A' }], ['b', { name: 'B' }], ['c', { name: 'C' }]])
    const rows = categoryBreakdown([tx('expense', 3000, 'a'), tx('expense', 1000, 'b'), tx('refund', 500, 'c')], cats)
    expect(rows.map((r) => r.categoryId)).toEqual(['a', 'b', 'c'])
    expect(rows[0].share).toBe(75)
    expect(rows[2].net).toBe(-500)
    expect(rows[2].share).toBe(0)
  })
})

describe('resolveBudget', () => {
  const budgets = [
    { category_id: null, month: null, amount_cents: 100000 },
    { category_id: null, month: '2026-12-01', amount_cents: 150000 },
    { category_id: 'food', month: null, amount_cents: 30000 },
  ]
  it('uses the monthly override when present', () => expect(resolveBudget(budgets, '2026-12')).toBe(150000))
  it('falls back to the default', () => expect(resolveBudget(budgets, '2026-09')).toBe(100000))
  it('resolves category budgets separately', () => expect(resolveBudget(budgets, '2026-12', 'food')).toBe(30000))
  it('returns null when nothing is set', () => expect(resolveBudget([], '2026-09')).toBeNull())
})

describe('budgetStatus', () => {
  it.each([
    [69999, 'ok'],
    [70000, 'near'],
    [90000, 'high'],
    [99999, 'high'],
    [100000, 'reached'],
    [100001, 'over'],
  ])('spent %i of 1000 € -> %s', (spent, level) => {
    expect(budgetStatus(spent, 100000).level).toBe(level)
  })

  it('reports remaining and overBy', () => {
    expect(budgetStatus(65280, 100000)).toMatchObject({ remaining: 34720, overBy: 0 })
    expect(budgetStatus(112000, 100000)).toMatchObject({ remaining: -12000, overBy: 12000 })
  })

  it('handles no budget', () => expect(budgetStatus(1000, null).level).toBe('none'))
})

describe('percentChange', () => {
  it('computes month over month change', () => expect(percentChange(88000, 100000)).toBeCloseTo(-12))
  it('returns null without a previous value', () => expect(percentChange(100, 0)).toBeNull())
})

describe('summariesByMonth', () => {
  it('groups by month key', () => {
    const rows = summariesByMonth(
      [tx('expense', 100, 'a', { occurred_on: '2026-08-31' }), tx('expense', 200, 'a', { occurred_on: '2026-09-01' })],
      ['2026-08', '2026-09'],
    )
    expect(rows.map((r) => r.netExpense)).toEqual([100, 200])
  })
})

describe('summariesByRange', () => {
  it('groups by arbitrary, non-calendar-month ranges (e.g. pay cycles)', () => {
    const rows = summariesByRange(
      [
        tx('expense', 100, 'a', { occurred_on: '2026-08-27' }), // just before the cycle
        tx('expense', 200, 'a', { occurred_on: '2026-08-28' }), // first day of cycle 1
        tx('expense', 300, 'a', { occurred_on: '2026-09-27' }), // last day of cycle 1
        tx('expense', 400, 'a', { occurred_on: '2026-09-28' }), // first day of cycle 2
      ],
      [
        { key: 'c1', start: '2026-08-28', end: '2026-09-27' },
        { key: 'c2', start: '2026-09-28', end: '2026-10-27' },
      ],
    )
    expect(rows.map((r) => r.netExpense)).toEqual([500, 400])
  })
})

describe('transactionSign', () => {
  it('maps types to signs', () => {
    expect(['expense', 'income', 'refund', 'transfer'].map(transactionSign)).toEqual([-1, 1, 1, 0])
  })
})
