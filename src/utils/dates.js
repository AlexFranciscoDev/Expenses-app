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

// ---------- Pay cycles ----------
// A pay cycle runs from `payday` of one month to the day before `payday` of the
// next. `payday` beyond the days in a given month is clamped to its last day
// (e.g. payday 31 in February lands on the 28th/29th), the common convention
// for "day of month" recurring dates.

function clampDayOfMonth(year, monthIndex, day) {
  return Math.min(day, new Date(year, monthIndex + 1, 0).getDate())
}

/** The pay cycle `offset` cycles away from the one containing `today` (0 = current). */
export function payCycleRange(payday, offset = 0, today = new Date()) {
  const startsThisMonth = today.getDate() >= clampDayOfMonth(today.getFullYear(), today.getMonth(), payday)
  const monthIndex = today.getMonth() + (startsThisMonth ? 0 : -1) + offset
  const year = today.getFullYear()
  const start = new Date(year, monthIndex, clampDayOfMonth(year, monthIndex, payday))
  const end = new Date(year, monthIndex + 1, clampDayOfMonth(year, monthIndex + 1, payday) - 1)
  return { start: toISODate(start), end: toISODate(end) }
}

/**
 * The slice of the PREVIOUS calendar month that belongs to the pay cycle covering
 * day 1 of `monthKey` — e.g. with payday 28, October's tail is "2026-09-28".."2026-09-30":
 * money from that paycheck that was spent before the calendar month even started.
 * Returns null when there is no tail (payday is the 1st, so cycle == calendar month).
 */
export function payCycleTailBeforeMonth(payday, monthKey) {
  const [y, m] = monthKey.split('-').map(Number) // m is 1-indexed
  const monthIndex = m - 1
  if (1 >= clampDayOfMonth(y, monthIndex, payday)) return null
  const prevMonthIndex = monthIndex - 1
  const start = new Date(y, prevMonthIndex, clampDayOfMonth(y, prevMonthIndex, payday))
  const end = new Date(y, monthIndex, 0) // day 0 of this month = last day of the previous one
  return { start: toISODate(start), end: toISODate(end) }
}

/** "28 Aug – 27 Sep 2026" (year shown once, or on both sides if the range spans two) */
export function formatRangeLabel(range) {
  const start = parseISODate(range.start)
  const end = parseISODate(range.end)
  const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4)
  const startLabel = start.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endLabel = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

/** "28 Aug" — compact label for chart axes */
export function formatDayMonth(iso) {
  return parseISODate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** "28–30 Sept" (or "28 Sept – 2 Oct" across months) — compact label for a short tail range */
export function formatTailRange({ start, end }) {
  if (start.slice(0, 7) !== end.slice(0, 7)) return `${formatDayMonth(start)} – ${formatDayMonth(end)}`
  const startDay = parseISODate(start).getDate()
  const endDay = parseISODate(end).getDate()
  const month = parseISODate(end).toLocaleDateString('en-GB', { month: 'short' })
  return startDay === endDay ? `${startDay} ${month}` : `${startDay}–${endDay} ${month}`
}
