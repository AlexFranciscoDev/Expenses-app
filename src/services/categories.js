import { supabase } from '../lib/supabase.js'

export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createCategory(fields) {
  const { data, error } = await supabase.from('categories').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, fields) {
  const { data, error } = await supabase.from('categories').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function countCategoryTransactions(id) {
  const { count, error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if (error) throw error
  return count ?? 0
}

/** Deletes a category, moving its transactions to targetId (required when it has transactions) */
export async function deleteCategory(id, targetId = null) {
  const { error } = await supabase.rpc('delete_category', { p_id: id, p_target_id: targetId })
  if (error) throw error
}
