import { describe, expect, it } from 'vitest'
import { centsToInput, formatMoney, parseMoneyToCents } from './money.js'

describe('parseMoneyToCents', () => {
  it.each([
    ['24,50', 2450],
    ['24.50', 2450],
    ['24,5', 2450],
    ['24', 2400],
    ['0,99', 99],
    [',5', 50],
    ['1.234,56', 123456],
    ['1,234.56', 123456],
    ['1,234', 123400],
    ['€ 12', 1200],
  ])('%s -> %i', (input, cents) => expect(parseMoneyToCents(input)).toBe(cents))

  it.each(['', '0', 'abc', '12,345,6789', '-5', '1.2345'])('rejects %s', (input) => {
    expect(parseMoneyToCents(input)).toBeNull()
  })
})

describe('formatMoney', () => {
  it('formats euros in English with grouping', () => {
    expect(formatMoney(142050)).toBe('€1,420.50')
    expect(formatMoney(2450)).toBe('€24.50')
  })
})

describe('centsToInput', () => {
  it('round trips', () => {
    expect(centsToInput(2450)).toBe('24.50')
    expect(centsToInput(2400)).toBe('24')
    expect(parseMoneyToCents(centsToInput(123405))).toBe(123405)
  })
})
