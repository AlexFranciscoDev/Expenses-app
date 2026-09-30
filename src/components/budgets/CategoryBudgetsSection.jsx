import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'
import Card from '../ui/Card.jsx'
import Modal from '../ui/Modal.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { CATEGORY_GROUPS } from '../../constants/categoryGroups.js'
import { useData } from '../../context/DataContext.jsx'
import { useBudgetedCategoryIds } from '../../hooks/useMonthBudget.js'
import { budgetStatus, netByCategory, resolveBudget } from '../../utils/finance.js'
import { formatMoney } from '../../utils/money.js'
import CategoryBudgetModal from './CategoryBudgetModal.jsx'

const BAR_TONE = { ok: 'brand', near: 'warning', high: 'warning', reached: 'warning', over: 'negative' }

function BudgetedRow({ category, status, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-subtle">
      <CategoryIconBadge category={category} />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{category.name}</span>
          <span className="tabular shrink-0 text-xs text-muted">
            {formatMoney(status.spent)} / {formatMoney(status.budget)}
          </span>
        </div>
        <ProgressBar value={status.usedPct} tone={BAR_TONE[status.level]} height="h-1.5" />
      </div>
    </button>
  )
}

/**
 * Optional per-category spending limits. Only categories that already have a limit are
 * listed; "Add category limit" opens a picker for the rest.
 */
export default function CategoryBudgetsSection({ month, transactions }) {
  const { categories, categoriesById, budgets } = useData()
  const budgetedIds = useBudgetedCategoryIds()
  const [picking, setPicking] = useState(false)
  const [editing, setEditing] = useState(null)

  const nets = useMemo(() => netByCategory(transactions), [transactions])

  const rows = budgetedIds
    .map((id) => categoriesById.get(id))
    .filter(Boolean)
    .map((category) => {
      const amount = resolveBudget(budgets, month, category.id)
      const spent = nets.get(category.id)?.net ?? 0
      return { category, status: budgetStatus(spent, amount) }
    })
    .sort((a, b) => b.status.usedPct - a.status.usedPct)

  const pickable = categories.filter((c) => c.kind === 'expense' && !budgetedIds.includes(c.id))
  const groups = CATEGORY_GROUPS.map((g) => ({ ...g, items: pickable.filter((c) => c.group_key === g.key) })).filter(
    (g) => g.items.length,
  )

  return (
    <Card className="mb-4 p-5">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Category limits</p>
        <button type="button" onClick={() => setPicking(true)} className="flex items-center gap-1 text-[13px] font-semibold text-brand">
          <Plus size={14} /> Add
        </button>
      </div>

      {rows.length ? (
        <div className="-mx-2 mt-2 flex flex-col">
          {rows.map((r) => (
            <BudgetedRow key={r.category.id} category={r.category} status={r.status} onClick={() => setEditing(r.category)} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Set a limit on categories like Restaurants or Coffee to get a warning when you&apos;re close to going over.
        </p>
      )}

      <Modal open={picking} onClose={() => setPicking(false)} title="Choose a category" size="lg">
        {groups.length ? (
          <div className="flex flex-col gap-5">
            {groups.map((g) => (
              <section key={g.key}>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g.label}</h3>
                <div className="flex flex-col">
                  {g.items.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setPicking(false)
                        setEditing(c)
                      }}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-subtle"
                    >
                      <CategoryIconBadge category={c} size="sm" />
                      <span className="text-sm font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted">Every expense category already has a limit.</p>
        )}
      </Modal>

      <CategoryBudgetModal category={editing} month={month} onClose={() => setEditing(null)} />
    </Card>
  )
}
