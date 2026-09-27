import { supabase } from '../lib/supabase.js'

const COLUMNS = 'id, type, amount_cents, category_id, description, notes, occurred_on, refund_of_id, payment_method, created_at, updated_at'

/** Transactions with occurred_on between start and end (inclusive), newest first */
export async function listTransactionsBetween(start, end) {
  const { data, error } = await supabase
    .from('transactions')
    .select(COLUMNS)
    .gte('occurred_on', start)
    .lte('occurred_on', end)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listRecentTransactions(limit = 200) {
  const { data, error } = await supabase
    .from('transactions')
    .select(COLUMNS)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function listAllTransactions() {
  const pageSize = 1000
  let from = 0
  const all = []
  for (;;) {
    const { data, error } = await supabase
      .from('transactions')
      .select(COLUMNS)
      .order('occurred_on', { ascending: true })
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw error
    all.push(...data)
    if (data.length < pageSize) return all
    from += pageSize
  }
}

export async function getTransaction(id) {
  const { data, error } = await supabase.from('transactions').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function listRefundsFor(expenseId) {
  const { data, error } = await supabase
    .from('transactions')
    .select(COLUMNS)
    .eq('refund_of_id', expenseId)
    .order('occurred_on', { ascending: true })
  if (error) throw error
  return data
}

export async function listTransactionsForCategory(categoryId, start, end) {
  const { data, error } = await supabase
    .from('transactions')
    .select(COLUMNS)
    .eq('category_id', categoryId)
    .gte('occurred_on', start)
    .lte('occurred_on', end)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Expenses to link a refund to, optionally filtered by text */
export async function searchExpenses(query = '', limit = 30) {
  let request = supabase
    .from('transactions')
    .select(COLUMNS)
    .eq('type', 'expense')
    .order('occurred_on', { ascending: false })
    .limit(limit)
  if (query.trim()) request = request.ilike('description', `%${query.trim()}%`)
  const { data, error } = await request
  if (error) throw error
  return data
}

export async function createTransaction(fields) {
  const { data, error } = await supabase.from('transactions').insert(fields).select(COLUMNS).single()
  if (error) throw error
  return data
}

export async function updateTransaction(id, fields) {
  const { data, error } = await supabase.from('transactions').update(fields).eq('id', id).select(COLUMNS).single()
  if (error) throw error
  return data
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

/** Category usage in the last 90 days, used to sort the quick category picker */
export async function categoryUsage(sinceISO) {
  const { data, error } = await supabase
    .from('transactions')
    .select('category_id')
    .gte('occurred_on', sinceISO)
  if (error) throw error
  const counts = new Map()
  for (const row of data) counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1)
  return counts
}
