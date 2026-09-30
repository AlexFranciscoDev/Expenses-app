import { useState } from 'react'
import { ERRORS, friendlyError } from '../../constants/copy.js'
import { useToast } from '../../context/ToastContext.jsx'
import { centsToInput, parseMoneyToCents } from '../../utils/money.js'
import Button from '../ui/Button.jsx'
import { Label } from '../ui/Field.jsx'
import MoneyInput from '../ui/MoneyInput.jsx'

/** A single "amount + Save" row used for both the global and per-category budget forms. */
export default function BudgetAmountEditor({ label, hint, initialCents, onSave, onRemove, saveLabel = 'Save' }) {
  const [value, setValue] = useState(centsToInput(initialCents))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const save = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const cents = parseMoneyToCents(value)
    if (!cents) return setError(ERRORS.invalidAmount)
    setSaving(true)
    setError(null)
    try {
      await onSave(cents)
      toast('Budget saved')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <MoneyInput value={value} onChange={setValue} placeholder="1,000" />
        </div>
        <Button type="submit" loading={saving}>
          {saveLabel}
        </Button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
      {onRemove && (
        <button type="button" onClick={onRemove} className="mt-2 text-xs font-semibold text-muted hover:text-negative">
          Remove
        </button>
      )}
    </form>
  )
}
