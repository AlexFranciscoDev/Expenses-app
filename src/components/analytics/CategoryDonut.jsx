import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from '../../utils/money.js'

const MAX_SLICES = 6
const OTHER_COLOR = '#cbd2dc'

/** Folds everything after the top slices into "Other" so the ring stays readable */
export function donutSlices(rows) {
  const positive = rows.filter((r) => r.net > 0)
  const top = positive.slice(0, MAX_SLICES).map((r) => ({
    id: r.categoryId,
    name: r.category?.name ?? 'Unknown',
    value: r.net,
    share: r.share,
    color: r.category?.color ?? OTHER_COLOR,
  }))
  const rest = positive.slice(MAX_SLICES)
  if (rest.length) {
    top.push({
      id: 'other',
      name: `Other (${rest.length})`,
      value: rest.reduce((s, r) => s + r.net, 0),
      share: rest.reduce((s, r) => s + r.share, 0),
      color: OTHER_COLOR,
    })
  }
  return top
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-float">
      <p className="flex items-center gap-1.5 font-semibold text-ink">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
        {d.name}
      </p>
      <p className="tabular mt-0.5 text-ink-soft">
        {formatMoney(d.value)} · {d.share.toFixed(1)}%
      </p>
    </div>
  )
}

export default function CategoryDonut({ rows, total }) {
  const slices = donutSlices(rows)
  const empty = slices.length === 0

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={empty ? [{ value: 1 }] : slices}
            dataKey="value"
            nameKey="name"
            innerRadius="76%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={empty || slices.length === 1 ? 0 : 1.5}
            cornerRadius={6}
            stroke="var(--color-surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {empty ? <Cell fill="var(--color-line)" /> : slices.map((s) => <Cell key={s.id} fill={s.color} />)}
          </Pie>
          {!empty && <Tooltip content={<DonutTooltip />} />}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted">Total spent</p>
        <p className="tabular text-2xl font-semibold tracking-tight">{formatMoney(total)}</p>
      </div>
    </div>
  )
}
