export const TRANSACTION_TYPES = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'refund', label: 'Refund' },
  { key: 'transfer', label: 'Transfer' },
]

export const TYPE_LABELS = Object.fromEntries(TRANSACTION_TYPES.map((t) => [t.key, t.label]))

export const PAYMENT_METHODS = [
  { key: 'card', label: 'Card' },
  { key: 'cash', label: 'Cash' },
  { key: 'bizum', label: 'Bizum' },
  { key: 'bank_transfer', label: 'Bank transfer' },
]

export const PAYMENT_LABELS = Object.fromEntries(PAYMENT_METHODS.map((p) => [p.key, p.label]))
