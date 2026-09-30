import { supabase } from '../lib/supabase.js'

export async function listBudgets() {
  const { data, error } = await supabase.from('budgets').select('*')
  if (error) throw error
  return data
}

/**
 * Creates or updates a budget, for either the calendar month or the pay-cycle view.
 * month = null sets the default. Otherwise: for periodType 'calendar', month is a
 * "YYYY-MM" month key (stored as its 1st); for 'payday', month is a cycle's start
 * date "YYYY-MM-DD", stored as-is. categoryId = null is the global budget.
 */
export async function saveBudget({ amountCents, month = null, categoryId = null, periodType = 'calendar' }) {
  const monthValue = month ? (periodType === 'calendar' ? `${month}-01` : month) : null
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { amount_cents: amountCents, month: monthValue, category_id: categoryId, period_type: periodType },
      { onConflict: 'user_id,category_id,period_type,month' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBudget(id) {
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  if (error) throw error
}
