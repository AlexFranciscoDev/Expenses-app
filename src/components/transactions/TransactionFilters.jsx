import { Search, X } from 'lucide-react'
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '../../constants/transactionTypes.js'
import { CATEGORY_GROUPS } from '../../constants/categoryGroups.js'
import { useData } from '../../context/DataContext.jsx'
import Chip from '../ui/Chip.jsx'
import { Input, Select } from '../ui/Field.jsx'

export const EMPTY_FILTERS = { query: '', type: null, categoryId: '', paymentMethod: '' }

export default function TransactionFilters({ filters, onChange }) {
  const { categories } = useData()
  const set = (patch) => onChange({ ...filters, ...patch })
  const active = filters.type || filters.categoryId || filters.paymentMethod || filters.query

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Search transactions"
          className="pl-10"
          type="search"
          autoComplete="off"
        />
      </div>

      <div className="no-scrollbar scroll-fade-x -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <Chip active={!filters.type} onClick={() => set({ type: null })}>
          All
        </Chip>
        {TRANSACTION_TYPES.map((t) => (
          <Chip key={t.key} active={filters.type === t.key} onClick={() => set({ type: filters.type === t.key ? null : t.key })}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={filters.categoryId} onChange={(e) => set({ categoryId: e.target.value })} aria-label="Category" className="h-10 text-sm">
          <option value="">All categories</option>
          {CATEGORY_GROUPS.map((g) => {
            const items = categories.filter((c) => c.group_key === g.key)
            if (!items.length) return null
            return (
              <optgroup key={g.key} label={g.label}>
                {items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </Select>
        <Select value={filters.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })} aria-label="Payment method" className="h-10 text-sm">
          <option value="">Any method</option>
          {PAYMENT_METHODS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      {active && (
        <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="flex items-center gap-1 self-start text-[13px] font-medium text-brand">
          <X size={14} /> Clear filters
        </button>
      )}
    </div>
  )
}

export function applyFilters(transactions, filters, categoriesById) {
  const q = filters.query.trim().toLowerCase()
  return transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false
    if (filters.categoryId && t.category_id !== filters.categoryId) return false
    if (filters.paymentMethod && t.payment_method !== filters.paymentMethod) return false
    if (q) {
      const haystack = [t.description, t.notes, categoriesById.get(t.category_id)?.name].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}
