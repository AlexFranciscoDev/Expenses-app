import { describe, expect, it } from 'vitest'
import { formatRangeLabel, payCycleRange } from './dates.js'

describe('payCycleRange', () => {
  it('starts a new cycle on the payday itself', () => {
    expect(payCycleRange(28, 0, new Date(2026, 8, 28))).toEqual({ start: '2026-09-28', end: '2026-10-27' })
  })

  it('is still in the previous cycle the day before payday', () => {
    expect(payCycleRange(28, 0, new Date(2026, 8, 27))).toEqual({ start: '2026-08-28', end: '2026-09-27' })
  })

  it('navigates to the previous and next cycle', () => {
    const today = new Date(2026, 8, 30) // Sep 30, inside the cycle that started Sep 28
    expect(payCycleRange(28, -1, today)).toEqual({ start: '2026-08-28', end: '2026-09-27' })
    expect(payCycleRange(28, 1, today)).toEqual({ start: '2026-10-28', end: '2026-11-27' })
  })

  it('clamps a payday beyond the days in a short month', () => {
    // payday 31: a cycle starting in February lands on the 28th (2026 is not a leap year)
    expect(payCycleRange(31, 0, new Date(2026, 1, 28))).toEqual({ start: '2026-02-28', end: '2026-03-30' })
  })

  it('handles payday 1 (cycle == calendar month)', () => {
    expect(payCycleRange(1, 0, new Date(2026, 8, 15))).toEqual({ start: '2026-09-01', end: '2026-09-30' })
  })
})

describe('formatRangeLabel', () => {
  it('formats a same-year range', () => {
    expect(formatRangeLabel({ start: '2026-08-28', end: '2026-09-27' })).toBe('28 Aug – 27 Sept 2026')
  })

  it('shows both years when the range spans two', () => {
    expect(formatRangeLabel({ start: '2026-12-28', end: '2027-01-27' })).toBe('28 Dec 2026 – 27 Jan 2027')
  })
})
