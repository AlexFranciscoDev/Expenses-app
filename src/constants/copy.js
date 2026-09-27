import { formatMoney } from '../utils/money.js'

// Reusable UI messages. Keeping them here makes future translation easy.
export const BUDGET_MESSAGES = {
  near: () => "You're getting close to your monthly budget.",
  high: (pct) => `You've used ${Math.floor(pct)}% of your monthly budget.`,
  reached: () => "You've reached your monthly budget.",
  over: (overBy) => `You're over your monthly budget by ${formatMoney(overBy)}.`,
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
