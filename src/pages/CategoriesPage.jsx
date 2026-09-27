import { useState } from 'react'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import CategoryForm from '../components/categories/CategoryForm.jsx'
import CategoryIconBadge from '../components/categories/CategoryIconBadge.jsx'
import DeleteCategoryDialog from '../components/categories/DeleteCategoryDialog.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import SegmentedControl from '../components/ui/SegmentedControl.jsx'
import { CATEGORY_GROUPS, CATEGORY_KINDS } from '../constants/categoryGroups.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { createCategory, deleteCategory, updateCategory } from '../services/categories.js'

export default function CategoriesPage() {
  const { categories, reloadCategories, notifyTransactionsChanged } = useData()
  const toast = useToast()
  const [kind, setKind] = useState('expense')
  const [editing, setEditing] = useState(null) // category object, or { kind } for a new one
  const [deleting, setDeleting] = useState(null)

  const groups = CATEGORY_GROUPS.map((g) => ({
    ...g,
    items: categories.filter((c) => c.kind === kind && c.group_key === g.key),
  })).filter((g) => g.items.length)

  const save = async (fields) => {
    if (editing.id) {
      const { kind: _kind, ...rest } = fields
      await updateCategory(editing.id, rest)
      toast('Category updated')
    } else {
      await createCategory({ ...fields, sort_order: 100 })
      toast('Category created')
    }
    await reloadCategories()
    setEditing(null)
  }

  const confirmDelete = async (targetId) => {
    await deleteCategory(deleting.id, targetId)
    await reloadCategories()
    notifyTransactionsChanged()
    setDeleting(null)
    toast('Category deleted')
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Categories"
        back="/settings"
        actions={
          <Button size="sm" onClick={() => setEditing({ kind })}>
            <Plus size={16} /> New
          </Button>
        }
      />
      <SegmentedControl options={CATEGORY_KINDS} value={kind} onChange={setKind} className="mb-4" />

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <section key={g.key}>
            <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{g.label}</h2>
            <Card className="p-2">
              {g.items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setEditing(c)}
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-subtle"
                >
                  <CategoryIconBadge category={c} />
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </Card>
          </section>
        ))}
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? 'Edit category' : 'New category'} size="lg">
        {editing && (
          <>
            <CategoryForm key={editing.id ?? 'new'} initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
            {editing.id && (
              <button
                type="button"
                onClick={() => {
                  setDeleting(editing)
                  setEditing(null)
                }}
                className="mt-4 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-semibold text-negative"
              >
                <Trash2 size={15} /> Delete category
              </button>
            )}
          </>
        )}
      </Modal>

      <DeleteCategoryDialog category={deleting} categories={categories} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  )
}
