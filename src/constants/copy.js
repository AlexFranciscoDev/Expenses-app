import { formatTailRange } from '../utils/dates.js'
import { formatMoney } from '../utils/money.js'

// Reusable UI messages. Keeping them here makes future translation easy.
// `subject` lets the same wording work for the global budget ("your monthly budget")
// and a category limit ("your Coffee limit").
export const BUDGET_MESSAGES = {
  near: (subject = 'your monthly budget') => `You're getting close to ${subject}.`,
  high: (pct, subject = 'your monthly budget') => `You've used ${Math.floor(pct)}% of ${subject}.`,
  reached: (subject = 'your monthly budget') => `You've reached ${subject}.`,
  over: (overBy, subject = 'your monthly budget') => `You're over ${subject} by ${formatMoney(overBy)}.`,
}

/**
 * Explains a calendar-month budget's carry-over: spending between payday and the
 * end of the previous month, which already came out of this paycheck. Returns
 * null when there's nothing to explain (no tail, or nothing spent in it).
 */
export function budgetTailNote(amountCents, tail) {
  if (!tail || !amountCents) return null
  return `Includes ${formatMoney(amountCents)} spent ${formatTailRange(tail)} — after payday, before this month started.`
}

export const ERRORS = {
  generic: 'Something went wrong. Please try again.',
  network: 'Could not connect. Check your internet connection and try again.',
  invalidAmount: 'Enter an amount greater than zero.',
  categoryRequired: 'Choose a category.',
  invalidLogin: 'Incorrect email or password.',
}

/** Turns Supabase/Postgres errors into short English messages */
export function friendlyError(error) {
  if (!error) return ERRORS.generic
  const message = error.message ?? String(error)
  if (/Failed to fetch|NetworkError|network/i.test(message)) return ERRORS.network
  if (/Invalid login credentials/i.test(message)) return ERRORS.invalidLogin
  if (/categories_user_name_key|duplicate key.*categor/i.test(message)) return 'A category with this name already exists.'
  if (error.code === 'P0001') return message
  return ERRORS.generic
}
