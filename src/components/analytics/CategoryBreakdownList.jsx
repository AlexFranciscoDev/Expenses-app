import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatMoney } from '../../utils/money.js'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'

export default function CategoryBreakdownList({ rows }) {
  return (
    <div className="flex flex-col">
      {rows.map((r) => (
        <Link key={r.categoryId} to={`/analytics/category/${r.categoryId}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-subtle">
          <CategoryIconBadge category={r.category} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.category?.name ?? 'Unknown'}</p>
            <p className="text-xs text-muted">
              {r.count} transaction{r.count === 1 ? '' : 's'}
              {r.refunds > 0 && ` · ${formatMoney(r.refunds)} refunded`}
            </p>
          </div>
          <div className="text-right">
            <p className="tabular text-sm font-semibold">{formatMoney(r.net)}</p>
            <p className="tabular text-xs text-muted">{r.share.toFixed(0)}%</p>
          </div>
          <ChevronRight size={16} className="text-muted" />
        </Link>
      ))}
    </div>
  )
}
