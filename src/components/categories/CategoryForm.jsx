import { useState } from 'react'
import { Check } from 'lucide-react'
import { CATEGORY_COLORS } from '../../constants/categoryColors.js'
import { CATEGORY_GROUPS, CATEGORY_KINDS } from '../../constants/categoryGroups.js'
import { CATEGORY_ICONS, ICON_KEYS } from '../../constants/categoryIcons.js'
import { friendlyError } from '../../constants/copy.js'
import Button from '../ui/Button.jsx'
import { Input, Label } from '../ui/Field.jsx'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import CategoryIconBadge from './CategoryIconBadge.jsx'

const defaultGroupFor = (kind) => (kind === 'income' ? 'income' : kind === 'transfer' ? 'transfers' : 'lifestyle')

/**
 * Create/edit a category. `lockKind` hides the kind selector (e.g. when creating from the
 * transaction form, where the kind is implied by the transaction type).
 */
export default function CategoryForm({ initial, lockKind = false, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState(initial?.kind ?? 'expense')
  const [groupKey, setGroupKey] = useState(initial?.group_key ?? defaultGroupFor(initial?.kind ?? 'expense'))
  const [icon, setIcon] = useState(initial?.icon ?? 'tag')
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = Boolean(initial?.id)
  const groups = CATEGORY_GROUPS.filter((g) => g.kind === kind || g.kind === null)

  const changeKind = (next) => {
    setKind(next)
    setGroupKey(defaultGroupFor(next))
  }

  const submit = async (e) => {
    e.preventDefault()
    // This form can be rendered in a portal inside another form; React would bubble the submit to it
    e.stopPropagation()
    if (!name.trim()) {
      setError('Enter a name.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), kind, group_key: groupKey, icon, color })
    } catch (err) {
      setError(friendlyError(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CategoryIconBadge category={{ icon, color }} size="lg" />
        <div className="flex-1">
          <Label htmlFor="category-name">Name</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Pets"
            autoComplete="off"
          />
        </div>
      </div>

      {!lockKind && !isEditing && (
        <div>
          <Label>Type</Label>
          <SegmentedControl options={CATEGORY_KINDS} value={kind} onChange={changeKind} />
        </div>
      )}

      <div>
        <Label>Group</Label>
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroupKey(g.key)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${
                groupKey === g.key ? 'border-brand bg-brand-soft text-brand' : 'border-line text-ink-soft'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Colour</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              onClick={() => setColor(c)}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: c }}
            >
              {color === c && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Icon</Label>
        <div className="grid max-h-44 grid-cols-8 gap-1.5 overflow-y-auto rounded-2xl border border-line p-2">
          {ICON_KEYS.map((key) => {
            const Icon = CATEGORY_ICONS[key]
            const active = key === icon
            return (
              <button
                key={key}
                type="button"
                aria-label={key}
                onClick={() => setIcon(key)}
                className={`flex aspect-square items-center justify-center rounded-xl ${active ? 'text-white' : 'text-ink-soft hover:bg-subtle'}`}
                style={active ? { backgroundColor: color } : undefined}
              >
                <Icon size={17} />
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {isEditing ? 'Save' : 'Create category'}
        </Button>
      </div>
    </form>
  )
}
