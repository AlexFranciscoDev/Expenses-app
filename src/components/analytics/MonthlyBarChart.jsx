import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMonth } from '../../utils/dates.js'
import { formatMoney } from '../../utils/money.js'

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-float">
      <p className="font-semibold text-ink">{formatMonth(d.month)}</p>
      <p className="tabular mt-0.5 text-ink-soft">Net spending: {formatMoney(d.netExpense)}</p>
      <p className="tabular text-ink-soft">Income: {formatMoney(d.income)}</p>
    </div>
  )
}

/** Net spending per month. The selected month is highlighted; the rest are muted. */
export default function MonthlyBarChart({ summaries, selectedMonth }) {
  const data = summaries.map((s) => ({ ...s, label: formatMonth(s.month, 'short'), euros: Math.max(s.netExpense, 0) / 100 }))
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <YAxis
            width={44}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickFormatter={(v) => (v >= 1000 ? `€${(v / 1000).toFixed(1)}k` : `€${v}`)}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--color-subtle)', radius: 8 }} />
          <Bar dataKey="euros" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.month} fill={d.month === selectedMonth ? 'var(--color-brand)' : '#c7d5fb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
