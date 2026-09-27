// Dates are handled as local "YYYY-MM-DD" strings and month keys "YYYY-MM"
// to avoid UTC shifts when converting to Date objects.

const pad = (n) => String(n).padStart(2, '0')

export function toISODate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayISO() {
  return toISODate(new Date())
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function currentMonthKey() {
  return todayISO().slice(0, 7)
}

export function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/** "2026-09" -> { start: "2026-09-01", end: "2026-09-30" } (inclusive) */
export function monthRange(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return { start: `${monthKey}-01`, end: `${monthKey}-${pad(last)}` }
}

export function monthKeyOf(iso) {
  return iso.slice(0, 7)
}

export function formatMonth(monthKey, style = 'long') {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  if (style === 'short') return date.toLocaleDateString('en-GB', { month: 'short' })
  if (style === 'monthOnly') return date.toLocaleDateString('en-GB', { month: 'long' })
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** "Today", "Yesterday" or "Mon, 22 Sep" (adds year when not the current one) */
export function formatDayLabel(iso) {
  const today = todayISO()
  if (iso === today) return 'Today'
  if (iso === toISODate(new Date(Date.now() - 86400000))) return 'Yesterday'
  const date = parseISODate(iso)
  const sameYear = iso.slice(0, 4) === today.slice(0, 4)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function formatShortDate(iso) {
  const date = parseISODate(iso)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Month keys from `monthKey - (count-1)` to `monthKey`, oldest first */
export function lastMonths(monthKey, count) {
  return Array.from({ length: count }, (_, i) => shiftMonth(monthKey, i - (count - 1)))
}
