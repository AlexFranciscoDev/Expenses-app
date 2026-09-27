import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { searchExpenses } from '../../services/transactions.js'
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorNotice from '../ui/ErrorNotice.jsx'
import { Input } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import Spinner from '../ui/Spinner.jsx'
import TransactionRow from './TransactionRow.jsx'

export default function RefundLinkPicker({ open, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 250)
  const { data, loading, error, reload } = useAsync(
    () => (open ? searchExpenses(debounced) : Promise.resolve([])),
    [open, debounced],
  )

  return (
    <Modal open={open} onClose={onClose} title="Link to an expense" size="lg">
      <p className="mb-3 text-[13px] text-muted">
        The refund will use the expense&apos;s category and reduce what you really spent on it.
      </p>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by description"
          className="pl-10"
          autoComplete="off"
        />
      </div>
      {error ? (
        <ErrorNotice error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : data?.length ? (
        <div className="-mx-2 flex flex-col">
          {data.map((t) => (
            <TransactionRow key={t.id} transaction={t} showDate onClick={() => onSelect(t)} />
          ))}
        </div>
      ) : (
        <EmptyState title="No expenses found" message="Try a different search." />
      )}
    </Modal>
  )
}
