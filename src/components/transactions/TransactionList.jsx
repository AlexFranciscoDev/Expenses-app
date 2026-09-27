import { useNavigate } from 'react-router-dom'
import { formatDayLabel } from '../../utils/dates.js'
import TransactionRow from './TransactionRow.jsx'

/** Transactions grouped by day (expects newest first) */
export default function TransactionList({ transactions }) {
  const navigate = useNavigate()
  const groups = []
  for (const t of transactions) {
    const last = groups[groups.length - 1]
    if (last && last.date === t.occurred_on) last.items.push(t)
    else groups.push({ date: t.occurred_on, items: [t] })
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.date}>
          <h3 className="mb-1 px-2 text-xs font-semibold text-muted">{formatDayLabel(g.date)}</h3>
          <div className="flex flex-col">
            {g.items.map((t) => (
              <TransactionRow key={t.id} transaction={t} onClick={() => navigate(`/transactions/${t.id}`)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
