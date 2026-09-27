import { describe, expect, it } from 'vitest'
import { pressKey, splitForDisplay } from './amountInput.js'

const type = (keys) => keys.split('').reduce((acc, k) => pressKey(acc, k === '<' ? 'back' : k), '')

describe('pressKey', () => {
  it('types amounts', () => expect(type('24.50')).toBe('24.50'))
  it('limits decimals to 2', () => expect(type('1.234')).toBe('1.23'))
  it('prevents double dots', () => expect(type('1..2')).toBe('1.2'))
  it('adds a leading zero', () => expect(type('.5')).toBe('0.5'))
  it('replaces a leading zero', () => expect(type('05')).toBe('5'))
  it('deletes', () => expect(type('12<3')).toBe('13'))
})

describe('splitForDisplay', () => {
  it('groups thousands', () => expect(splitForDisplay('1234.5')).toEqual({ int: '1,234', dec: '.5' }))
  it('shows zero when empty', () => expect(splitForDisplay('')).toEqual({ int: '0', dec: '' }))
})
