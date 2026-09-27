import { listAllTransactions } from './transactions.js'
import { TYPE_LABELS, PAYMENT_LABELS } from '../constants/transactionTypes.js'
import { todayISO } from '../utils/dates.js'

const escape = (value) => {
  if (value == null) return ''
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Downloads every transaction as a CSV backup */
export async function exportTransactionsCsv(categoriesById) {
  const rows = await listAllTransactions()
  const header = ['date', 'type', 'amount', 'category', 'description', 'notes', 'payment_method', 'refund_of_id', 'id']
  const lines = rows.map((t) =>
    [
      t.occurred_on,
      TYPE_LABELS[t.type],
      (t.amount_cents / 100).toFixed(2),
      categoriesById.get(t.category_id)?.name,
      t.description,
      t.notes,
      PAYMENT_LABELS[t.payment_method],
      t.refund_of_id,
      t.id,
    ]
      .map(escape)
      .join(','),
  )
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ledger-transactions-${todayISO()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  return rows.length
}
