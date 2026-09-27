import { Link2 } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { PAYMENT_LABELS, TYPE_LABELS } from '../../constants/transactionTypes.js'
import { formatDayLabel } from '../../utils/dates.js'
import { transactionSign } from '../../utils/finance.js'
import { formatSigned } from '../../utils/money.js'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'

const AMOUNT_TONE = { expense: 'text-ink', income: 'text-positive', refund: 'text-positive', transfer: 'text-muted' }

export default function TransactionRow({ transaction: t, onClick, showDate = false, trailing }) {
  const { categoriesById } = useData()
  const category = categoriesById.get(t.category_id)
  const title = t.description || category?.name || TYPE_LABELS[t.type]

  const meta = [category?.name]
  if (t.type === 'refund') meta.push('Refund')
  if (t.type === 'transfer') meta.push('Transfer')
  if (t.payment_method) meta.push(PAYMENT_LABELS[t.payment_method])
  if (showDate) meta.push(formatDayLabel(t.occurred_on))

  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-subtle"
    >
      <CategoryIconBadge category={category} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-medium">
          <span className="truncate">{title}</span>
          {t.refund_of_id && <Link2 size={13} className="shrink-0 text-muted" aria-label="Linked to an expense" />}
        </p>
        <p className="truncate text-xs text-muted">{meta.filter(Boolean).join(' · ')}</p>
      </div>
      {trailing ?? (
        <span className={`tabular shrink-0 text-sm font-semibold ${AMOUNT_TONE[t.type]}`}>
          {formatSigned(t.amount_cents, transactionSign(t.type))}
        </span>
      )}
    </Tag>
  )
}
