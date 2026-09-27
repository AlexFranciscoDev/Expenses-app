const formatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** 2450 -> "€24.50" */
export function formatMoney(cents, { compact = false } = {}) {
  const value = (cents ?? 0) / 100
  return (compact ? compactFormatter : formatter).format(value)
}

/** Signed display for a transaction: "-€24.50", "+€1,500.00" or "€50.00" */
export function formatSigned(cents, sign) {
  const base = formatMoney(Math.abs(cents))
  if (sign > 0) return `+${base}`
  if (sign < 0) return `-${base}`
  return base
}

/**
 * Parses user input into integer cents. Accepts "24,50", "24.50", "1.234,56", "1,234.56".
 * The last separator is the decimal one unless it is followed by exactly 3 digits ("1,234").
 * Returns null when the input is not a valid positive amount.
 */
export function parseMoneyToCents(input) {
  if (input == null) return null
  const s = String(input).trim().replace(/[€\s]/g, '')
  if (!s || !/^[\d.,]+$/.test(s)) return null

  const decimalIndex = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'))
  let intPart = s
  let fracPart = ''
  if (decimalIndex !== -1) {
    const tail = s.slice(decimalIndex + 1)
    if (tail.length <= 2) {
      intPart = s.slice(0, decimalIndex)
      fracPart = tail
    } else if (tail.length !== 3) {
      return null
    }
  }
  intPart = intPart.replace(/[.,]/g, '')
  if (!intPart && !fracPart) return null

  const cents = Number(intPart || '0') * 100 + Number(fracPart.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents) || cents <= 0) return null
  return cents
}

/** 2450 -> "24.50" (for inputs) */
export function centsToInput(cents) {
  if (!cents) return ''
  const euros = Math.floor(cents / 100)
  const rest = cents % 100
  return rest ? `${euros}.${String(rest).padStart(2, '0')}` : String(euros)
}
