import { Link } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import CategoryIconBadge from '../categories/CategoryIconBadge.jsx'
import { formatMoney } from '../../utils/money.js'

const TONE = {
  near: 'bg-warning-soft text-warning',
  high: 'bg-warning-soft text-warning',
  reached: 'bg-warning-soft text-warning',
  over: 'bg-negative-soft text-negative',
}

/** Compact "close to the limit" list for categories that have their own budget. */
export default function CategoryBudgetAlerts({ rows }) {
  if (!rows.length) return null
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ category, status }) => (
        <Link
          key={category.id}
          to={`/analytics/category/${category.id}`}
          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium ${TONE[status.level]}`}
        >
          <CategoryIconBadge category={category} size="sm" />
          <span className="flex-1">
            {status.level === 'over'
              ? `Over your ${category.name} limit by ${formatMoney(status.overBy)}`
              : `${Math.round(status.usedPct)}% of your ${category.name} limit`}
          </span>
          {status.level === 'over' && <TriangleAlert size={15} className="shrink-0" />}
        </Link>
      ))}
    </div>
  )
}
