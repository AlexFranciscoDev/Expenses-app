import { Link } from 'react-router-dom'
import { formatMoney } from '../../utils/money.js'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'
import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

export default function TopCategories({ rows, limit = 5 }) {
  const top = rows.filter((r) => r.net > 0).slice(0, limit)
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Spending by category</h2>
        <Link to="/analytics" className="text-[13px] font-semibold text-brand">
          See all
        </Link>
      </div>
      {top.length ? (
        <div className="flex flex-col">
          {top.map((r) => (
            <Link key={r.categoryId} to={`/analytics/category/${r.categoryId}`} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-subtle">
              <CategoryIconBadge category={r.category} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">{r.category?.name ?? 'Unknown'}</span>
                  <span className="tabular text-sm font-semibold">{formatMoney(r.net)}</span>
                </div>
                <ProgressBar value={r.share} color={r.category?.color} height="h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-[13px] text-muted">No spending this month yet.</p>
      )}
    </Card>
  )
}
