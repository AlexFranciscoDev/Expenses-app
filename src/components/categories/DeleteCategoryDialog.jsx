import { useEffect, useState } from 'react'
import { friendlyError } from '../../constants/copy.js'
import { countCategoryTransactions } from '../../services/categories.js'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import { Label, Select } from '../ui/Field.jsx'
import Spinner from '../ui/Spinner.jsx'

/** Asks where to move a category's transactions before deleting it */
export default function DeleteCategoryDialog({ category, categories, onCancel, onConfirm }) {
  const [count, setCount] = useState(null)
  const [targetId, setTargetId] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!category) return
    setCount(null)
    setTargetId('')
    setError(null)
    countCategoryTransactions(category.id).then(setCount).catch(setError)
  }, [category])

  const targets = categories.filter((c) => c.kind === category?.kind && c.id !== category?.id)

  const confirm = async () => {
    if (count > 0 && !targetId) return setError({ message: 'Choose a category to move the transactions to.', code: 'P0001' })
    setDeleting(true)
    try {
      await onConfirm(targetId || null)
    } catch (e) {
      setError(e)
      setDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={Boolean(category)}
      title={`Delete "${category?.name}"?`}
      loading={deleting}
      onCancel={onCancel}
      onConfirm={confirm}
    >
      {count == null && !error ? (
        <Spinner className="py-4" />
      ) : count > 0 ? (
        <div>
          <p className="mb-3 text-sm leading-relaxed text-muted">
            This category has <strong className="text-ink">{count}</strong> transaction{count === 1 ? '' : 's'}. They won&apos;t be deleted: choose
            where to move them.
          </p>
          <Label htmlFor="target-category">Move transactions to</Label>
          <Select id="target-category" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">Choose a category</option>
            {targets.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        count === 0 && <p className="text-sm text-muted">This category has no transactions.</p>
      )}
      {error && <p className="mt-3 text-sm text-negative">{friendlyError(error)}</p>}
    </ConfirmDialog>
  )
}
