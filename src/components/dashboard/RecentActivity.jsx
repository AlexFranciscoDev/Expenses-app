import { Link, useNavigate } from 'react-router-dom'
import TransactionRow from '../transactions/TransactionRow.jsx'
import Card from '../ui/Card.jsx'

export default function RecentActivity({ transactions, limit = 6 }) {
  const navigate = useNavigate()
  const items = transactions.slice(0, limit)
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Recent activity</h2>
        <Link to="/transactions" className="text-[13px] font-semibold text-brand">
          See all
        </Link>
      </div>
      {items.length ? (
        <div className="-mx-2 flex flex-col">
          {items.map((t) => (
            <TransactionRow key={t.id} transaction={t} showDate onClick={() => navigate(`/transactions/${t.id}`)} />
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-[13px] text-muted">No transactions this month.</p>
      )}
    </Card>
  )
}
