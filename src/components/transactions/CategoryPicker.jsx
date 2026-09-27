import { useMemo, useState } from 'react'
import { LayoutGrid, Plus } from 'lucide-react'
import { CATEGORY_GROUPS } from '../../constants/categoryGroups.js'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'
import Modal from '../ui/Modal.jsx'

const QUICK_COUNT = 7

function Tile({ category, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 transition-colors ${
        active ? 'border-brand bg-brand-soft' : 'border-transparent hover:bg-subtle'
      }`}
    >
      <CategoryIconBadge category={category} size="md" />
      <span className={`w-full truncate text-center text-[11px] font-medium ${active ? 'text-brand' : 'text-ink-soft'}`}>
        {category.name}
      </span>
    </button>
  )
}

/**
 * Shows the most used categories as tiles, plus "More" (full list grouped) and "New".
 * `categories` must already be filtered by kind and sorted by usage.
 */
export default function CategoryPicker({ categories, value, onChange, onCreate }) {
  const [showAll, setShowAll] = useState(false)

  const quick = useMemo(() => {
    const top = categories.slice(0, QUICK_COUNT)
    const selected = categories.find((c) => c.id === value)
    if (selected && !top.some((c) => c.id === selected.id)) return [...top.slice(0, QUICK_COUNT - 1), selected]
    return top
  }, [categories, value])

  const grouped = useMemo(
    () =>
      CATEGORY_GROUPS.map((g) => ({ ...g, items: categories.filter((c) => c.group_key === g.key) })).filter(
        (g) => g.items.length,
      ),
    [categories],
  )

  const pick = (id) => {
    onChange(id)
    setShowAll(false)
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5">
        {quick.map((c) => (
          <Tile key={c.id} category={c} active={c.id === value} onClick={() => onChange(c.id)} />
        ))}
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 hover:bg-subtle"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-dashed border-line text-muted">
            <LayoutGrid size={18} />
          </span>
          <span className="text-[11px] font-medium text-muted">More</span>
        </button>
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Choose a category" size="lg">
        <div className="flex flex-col gap-5">
          {grouped.map((g) => (
            <section key={g.key}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g.label}</h3>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                {g.items.map((c) => (
                  <Tile key={c.id} category={c} active={c.id === value} onClick={() => pick(c.id)} />
                ))}
              </div>
            </section>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowAll(false)
              onCreate()
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-3 text-sm font-semibold text-brand hover:bg-subtle"
          >
            <Plus size={16} /> New category
          </button>
        </div>
      </Modal>
    </>
  )
}
