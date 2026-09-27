import { supabase } from '../lib/supabase.js'

export async function listBudgets() {
  const { data, error } = await supabase.from('budgets').select('*')
  if (error) throw error
  return data
}

/**
 * Creates or updates a budget. month = null sets the default; month "YYYY-MM" sets an override.
 * categoryId = null is the global budget.
 */
export async function saveBudget({ amountCents, month = null, categoryId = null }) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { amount_cents: amountCents, month: month ? `${month}-01` : null, category_id: categoryId },
      { onConflict: 'user_id,category_id,month' },
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
