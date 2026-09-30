import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../../utils/money.js'

function BarTooltip({ active, payload, tooltipLabel }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-float">
      <p className="font-semibold text-ink">{tooltipLabel(d)}</p>
      <p className="tabular mt-0.5 text-ink-soft">Net spending: {formatMoney(d.netExpense)}</p>
      <p className="tabular text-ink-soft">Income: {formatMoney(d.income)}</p>
    </div>
  )
}

/**
 * Net spending per period (calendar months or pay cycles). The active period
 * (`selectedKey`) is highlighted; the rest are muted. `labelFor`/`tooltipLabel`
 * format each summary's axis tick and tooltip heading.
 */
export default function MonthlyBarChart({ summaries, selectedKey, labelFor, tooltipLabel = labelFor }) {
  const data = summaries.map((s) => ({ ...s, label: labelFor(s), euros: Math.max(s.netExpense, 0) / 100 }))
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
          <Tooltip content={<BarTooltip tooltipLabel={tooltipLabel} />} cursor={{ fill: 'var(--color-subtle)', radius: 8 }} />
          <Bar dataKey="euros" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.key === selectedKey ? 'var(--color-brand)' : '#c7d5fb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
