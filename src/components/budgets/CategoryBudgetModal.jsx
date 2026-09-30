import { useState } from 'react'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import { friendlyError } from '../../constants/copy.js'
import { useData } from '../../context/DataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useMonthBudget } from '../../hooks/useMonthBudget.js'
import { deleteBudget, saveBudget } from '../../services/budgets.js'
import { formatMonth } from '../../utils/dates.js'
import BudgetAmountEditor from './BudgetAmountEditor.jsx'

/** Set a spending limit (default + optional monthly override) for one category. */
export default function CategoryBudgetModal({ category, month, onClose }) {
  const { reloadBudgets } = useData()
  const toast = useToast()
  const { defaultBudget, override } = useMonthBudget(month, category?.id)
  const [editingOverride, setEditingOverride] = useState(false)
  const [removing, setRemoving] = useState(false)
  const monthName = formatMonth(month)

  const remove = async (budget) => {
    setRemoving(true)
    try {
      await deleteBudget(budget.id)
      await reloadBudgets()
      toast('Limit removed')
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Modal open={Boolean(category)} onClose={onClose} title="Category limit">
      {category && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <CategoryIconBadge category={category} />
            <p className="text-sm font-semibold">{category.name}</p>
          </div>

          <BudgetAmountEditor
            key={`default-${defaultBudget?.id ?? 'none'}-${defaultBudget?.amount_cents}`}
            label="Default monthly limit"
            hint="Applies to every month unless you set a custom amount for a specific month."
            initialCents={defaultBudget?.amount_cents}
            onSave={async (cents) => {
              await saveBudget({ amountCents: cents, categoryId: category.id })
              await reloadBudgets()
            }}
            onRemove={defaultBudget ? () => remove(defaultBudget) : undefined}
          />

          <div className="border-t border-line pt-5">
            {override || editingOverride ? (
              <BudgetAmountEditor
                key={`override-${month}-${override?.amount_cents}`}
                label={`Custom limit for ${monthName}`}
                initialCents={override?.amount_cents ?? defaultBudget?.amount_cents}
                onSave={async (cents) => {
                  await saveBudget({ amountCents: cents, month, categoryId: category.id })
                  await reloadBudgets()
                  setEditingOverride(false)
                }}
                onRemove={override ? () => remove(override) : () => setEditingOverride(false)}
              />
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Different limit for {monthName}?</p>
                  <p className="text-xs text-muted">Useful for a month you expect to spend more or less.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setEditingOverride(true)}>
                  Set
                </Button>
              </div>
            )}
          </div>

          {removing && <p className="text-xs text-muted">Removing…</p>}
        </div>
      )}
    </Modal>
  )
}
