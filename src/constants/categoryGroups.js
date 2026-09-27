export const CATEGORY_GROUPS = [
  { key: 'essentials', label: 'Essentials', kind: 'expense' },
  { key: 'lifestyle', label: 'Lifestyle', kind: 'expense' },
  { key: 'growth', label: 'Growth', kind: 'expense' },
  { key: 'giving', label: 'Giving', kind: 'expense' },
  { key: 'finance', label: 'Finance', kind: 'expense' },
  { key: 'income', label: 'Income', kind: 'income' },
  { key: 'transfers', label: 'Transfers', kind: 'transfer' },
  { key: 'other', label: 'Other', kind: null },
]

export const GROUP_LABELS = Object.fromEntries(CATEGORY_GROUPS.map((g) => [g.key, g.label]))

export const CATEGORY_KINDS = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
]

/** Category kind used by each transaction type (refunds reduce expense categories) */
export const KIND_FOR_TYPE = {
  expense: 'expense',
  refund: 'expense',
  income: 'income',
  transfer: 'transfer',
}
