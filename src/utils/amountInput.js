// Helpers for the keypad amount string, e.g. "1234.5"

const MAX_INT_DIGITS = 8

export function pressKey(current, key) {
  if (key === 'back') return current.slice(0, -1)
  if (key === '.') {
    if (current.includes('.')) return current
    return current ? `${current}.` : '0.'
  }
  const [intPart, decPart] = current.split('.')
  if (decPart !== undefined) {
    if (decPart.length >= 2) return current
    return current + key
  }
  if (intPart === '0') return key
  if (intPart.length >= MAX_INT_DIGITS) return current
  return current + key
}

/** "1234.5" -> { int: "1,234", dec: ".5" } for display */
export function splitForDisplay(value) {
  const [intPart = '', decPart] = value.split('.')
  const int = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return { int, dec: decPart !== undefined ? `.${decPart}` : '' }
}
