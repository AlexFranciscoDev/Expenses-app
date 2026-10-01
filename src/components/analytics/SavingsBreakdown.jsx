import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatMoney } from '../../utils/money.js'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'

/** Simple list of money moved to Savings/Investments this period — not a share-of-total chart. */
export default function SavingsBreakdown({ rows }) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  return (
    <div className="flex flex-col">
      {rows.map((r) => (
        <Link key={r.categoryId} to={`/analytics/category/${r.categoryId}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-subtle">
          <CategoryIconBadge category={r.category} />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{r.category?.name ?? 'Unknown'}</p>
          <p className="tabular text-sm font-semibold">{formatMoney(r.amount)}</p>
          <ChevronRight size={16} className="text-muted" />
        </Link>
      ))}
      {rows.length > 1 && (
        <div className="flex items-center justify-between border-t border-line px-2 pt-2.5 text-sm font-semibold">
          <span>Total</span>
          <span className="tabular">{formatMoney(total)}</span>
        </div>
      )}
    </div>
  )
}
