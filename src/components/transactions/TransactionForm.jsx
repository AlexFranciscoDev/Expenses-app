import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Link2, StickyNote, X } from 'lucide-react'
import { KIND_FOR_TYPE } from '../../constants/categoryGroups.js'
import { ERRORS, friendlyError } from '../../constants/copy.js'
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '../../constants/transactionTypes.js'
import { useData } from '../../context/DataContext.jsx'
import { useCoarsePointer } from '../../hooks/useCoarsePointer.js'
import { createCategory } from '../../services/categories.js'
import { categoryUsage } from '../../services/transactions.js'
import { pressKey } from '../../utils/amountInput.js'
import { formatShortDate, toISODate, todayISO } from '../../utils/dates.js'
import { centsToInput, formatMoney, parseMoneyToCents } from '../../utils/money.js'
import CategoryForm from '../categories/CategoryForm.jsx'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import { Input, Textarea } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import AmountDisplay from './AmountDisplay.jsx'
import AmountKeypad from './AmountKeypad.jsx'
import CategoryPicker from './CategoryPicker.jsx'
import RefundLinkPicker from './RefundLinkPicker.jsx'

const SUBMIT_LABELS = {
  expense: 'Add expense',
  income: 'Add income',
  refund: 'Add refund',
  transfer: 'Add transfer',
}

const PLACEHOLDERS = {
  expense: 'e.g. Mercadona',
  income: 'e.g. September salary',
  refund: 'e.g. Bizum from Juan',
  transfer: 'e.g. Monthly savings',
}

function SectionLabel({ children }) {
  return <p className="mb-2 text-xs font-medium text-muted">{children}</p>
}

/**
 * Quick add/edit form. `initial` may contain any transaction fields;
 * `initialLinkedExpense` is the expense a refund is linked to (if any).
 */
export default function TransactionForm({ initial = {}, initialLinkedExpense = null, isEditing = false, onSubmit, onClose }) {
  const { categories, reloadCategories } = useData()
  const coarse = useCoarsePointer()

  const [type, setType] = useState(initial.type ?? 'expense')
  const [amount, setAmount] = useState(centsToInput(initial.amount_cents))
  const [categoryId, setCategoryId] = useState(initial.category_id ?? null)
  const [description, setDescription] = useState(initial.description ?? '')
  const [date, setDate] = useState(initial.occurred_on ?? todayISO())
  const [paymentMethod, setPaymentMethod] = useState(initial.payment_method ?? null)
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [showNotes, setShowNotes] = useState(Boolean(initial.notes))
  const [linkedExpense, setLinkedExpense] = useState(initialLinkedExpense)

  const [keypadOpen, setKeypadOpen] = useState(true)
  const dateInputRef = useRef(null)
  const [linkPickerOpen, setLinkPickerOpen] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [usage, setUsage] = useState(new Map())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const since = toISODate(new Date(Date.now() - 90 * 86400000))
    categoryUsage(since).then(setUsage).catch(() => {})
  }, [])

  const kind = KIND_FOR_TYPE[type]
  const kindCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === kind)
        .sort((a, b) => (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0) || a.sort_order - b.sort_order),
    [categories, kind, usage],
  )

  const changeType = (next) => {
    setType(next)
    setError(null)
    const selected = categories.find((c) => c.id === categoryId)
    if (selected && selected.kind !== KIND_FOR_TYPE[next]) setCategoryId(null)
    if (next !== 'refund') setLinkedExpense(null)
  }

  const linkExpense = (expense) => {
    setLinkedExpense(expense)
    setCategoryId(expense.category_id)
    setLinkPickerOpen(false)
  }

  const onKey = (key) => {
    setError(null)
    setAmount((current) => pressKey(current, key))
  }

  const openDatePicker = () => {
    setKeypadOpen(false)
    const input = dateInputRef.current
    if (!input) return
    // showPicker() opens the native calendar directly; focus() is the fallback
    // for browsers without it (iOS Safari still opens its wheel picker on focus).
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        // fall through to focus()
      }
    }
    input.focus()
  }

  const handleCreateCategory = async (fields) => {
    const created = await createCategory({ ...fields, kind, sort_order: 100 })
    await reloadCategories()
    setCategoryId(created.id)
    setCreatingCategory(false)
  }

  const submit = async (e) => {
    e?.preventDefault()
    const amountCents = parseMoneyToCents(amount)
    if (!amountCents) return setError(ERRORS.invalidAmount)
    const finalCategoryId = linkedExpense ? linkedExpense.category_id : categoryId
    if (!finalCategoryId) return setError(ERRORS.categoryRequired)

    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        type,
        amount_cents: amountCents,
        category_id: finalCategoryId,
        description: description.trim() || null,
        notes: notes.trim() || null,
        occurred_on: date,
        payment_method: paymentMethod,
        refund_of_id: type === 'refund' && linkedExpense ? linkedExpense.id : null,
      })
    } catch (err) {
      setError(friendlyError(err))
      setSaving(false)
    }
  }

  const yesterday = toISODate(new Date(Date.now() - 86400000))
  const isOtherDate = date !== todayISO() && date !== yesterday
  const showKeypad = coarse && keypadOpen

  return (
    <form
      onSubmit={submit}
      className="flex h-dvh flex-col bg-surface lg:h-auto lg:max-h-[calc(100dvh-4rem)] lg:rounded-3xl lg:border lg:border-line lg:shadow-float"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-3 pt-safe lg:px-6 lg:pt-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-subtle"
        >
          <X size={18} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold">{isEditing ? 'Edit transaction' : 'New transaction'}</h1>
        <span className="w-10" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 lg:px-6">
        <SegmentedControl options={TRANSACTION_TYPES} value={type} onChange={changeType} className="mt-2" />

        {coarse ? (
          <AmountDisplay
            value={amount}
            type={type}
            active={keypadOpen}
            onClick={() => {
              document.activeElement?.blur?.()
              setKeypadOpen(true)
            }}
          />
        ) : (
          <div className="flex items-baseline justify-center gap-1 py-5">
            <span className="text-3xl font-semibold text-muted">€</span>
            <input
              aria-label="Amount"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(e) => {
                setError(null)
                setAmount(e.target.value.replace(/[^\d.,]/g, ''))
              }}
              placeholder="0.00"
              className="tabular w-56 bg-transparent text-center text-5xl font-semibold tracking-tight outline-none placeholder:text-muted/40"
              style={{ fontSize: '3rem' }}
            />
          </div>
        )}

        {type === 'refund' && (
          <div className="mb-4">
            {linkedExpense ? (
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-subtle p-3">
                <Link2 size={16} className="text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{linkedExpense.description || 'Expense'}</p>
                  <p className="text-xs text-muted">
                    {formatMoney(linkedExpense.amount_cents)} · {formatShortDate(linkedExpense.occurred_on)}
                  </p>
                </div>
                <button type="button" onClick={() => setLinkedExpense(null)} className="text-xs font-semibold text-muted hover:text-ink">
                  Unlink
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLinkPickerOpen(true)}
                className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-line px-3 py-3 text-sm font-medium text-brand hover:bg-subtle"
              >
                <Link2 size={16} /> Link to an expense (optional)
              </button>
            )}
          </div>
        )}

        <div className="mb-4">
          <SectionLabel>Category</SectionLabel>
          {linkedExpense ? (
            <div className="flex items-center gap-2 text-sm">
              <CategoryIconBadge category={categories.find((c) => c.id === linkedExpense.category_id)} size="sm" />
              {categories.find((c) => c.id === linkedExpense.category_id)?.name}
              <span className="text-xs text-muted">(from the linked expense)</span>
            </div>
          ) : (
            <CategoryPicker
              categories={kindCategories}
              value={categoryId}
              onChange={(id) => {
                setError(null)
                setCategoryId(id)
              }}
              onCreate={() => setCreatingCategory(true)}
            />
          )}
        </div>

        <div className="mb-4">
          <SectionLabel>Description</SectionLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setKeypadOpen(false)}
            placeholder={PLACEHOLDERS[type]}
            maxLength={120}
            autoComplete="off"
            enterKeyHint="done"
          />
        </div>

        <div className="mb-4">
          <SectionLabel>Date</SectionLabel>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Chip active={date === todayISO()} onClick={() => setDate(todayISO())}>
              Today
            </Chip>
            <Chip active={date === yesterday} onClick={() => setDate(yesterday)}>
              Yesterday
            </Chip>
            <button
              type="button"
              onClick={openDatePicker}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium ${
                isOtherDate ? 'border-brand bg-brand-soft text-brand' : 'border-line text-ink-soft'
              }`}
            >
              <CalendarDays size={14} />
              {isOtherDate ? formatShortDate(date) : 'Other date'}
              <input
                ref={dateInputRef}
                type="date"
                aria-label="Pick a date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="sr-only"
              />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <SectionLabel>Paid with (optional)</SectionLabel>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {PAYMENT_METHODS.map((p) => (
              <Chip key={p.key} active={paymentMethod === p.key} onClick={() => setPaymentMethod(paymentMethod === p.key ? null : p.key)}>
                {p.label}
              </Chip>
            ))}
          </div>
        </div>

        {showNotes ? (
          <div>
            <SectionLabel>Notes</SectionLabel>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onFocus={() => setKeypadOpen(false)} maxLength={1000} placeholder="Optional" />
          </div>
        ) : (
          <button type="button" onClick={() => setShowNotes(true)} className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
            <StickyNote size={14} /> Add a note
          </button>
        )}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-line bg-surface px-4 pb-safe pt-3 lg:px-6 lg:pb-5">
        {error && (
          <p role="alert" className="mb-2 text-center text-sm font-medium text-negative">
            {error}
          </p>
        )}
        {showKeypad && (
          <div className="mb-3">
            <AmountKeypad onKey={onKey} />
          </div>
        )}
        <Button type="submit" size="lg" className="mb-3 w-full" loading={saving}>
          {isEditing ? 'Save changes' : SUBMIT_LABELS[type]}
        </Button>
      </div>

      <RefundLinkPicker open={linkPickerOpen} onClose={() => setLinkPickerOpen(false)} onSelect={linkExpense} />

      <Modal open={creatingCategory} onClose={() => setCreatingCategory(false)} title="New category" size="lg">
        <CategoryForm
          initial={{ kind }}
          lockKind
          onSubmit={handleCreateCategory}
          onCancel={() => setCreatingCategory(false)}
        />
      </Modal>
    </form>
  )
}
