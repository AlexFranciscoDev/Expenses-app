import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Link2, Pencil, Plus, Trash2 } from 'lucide-react'
import CategoryIconBadge from '../components/categories/CategoryIconBadge.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import TransactionRow from '../components/transactions/TransactionRow.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { friendlyError } from '../constants/copy.js'
import { PAYMENT_LABELS, TYPE_LABELS } from '../constants/transactionTypes.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { deleteTransaction, getTransaction, listRefundsFor } from '../services/transactions.js'
import { formatDayLabel } from '../utils/dates.js'
import { transactionSign } from '../utils/finance.js'
import { formatMoney, formatSigned } from '../utils/money.js'

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  )
}

export default function TransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { categoriesById, notifyTransactionsChanged, version } = useData()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data, loading, error, reload } = useAsync(async () => {
    const t = await getTransaction(id)
    if (!t) return null
    const [refunds, original] = await Promise.all([
      t.type === 'expense' ? listRefundsFor(t.id) : [],
      t.refund_of_id ? getTransaction(t.refund_of_id) : null,
    ])
    return { t, refunds, original }
  }, [id, version])

  if (loading && !data) return <Spinner className="h-96" />
  if (error) return <ErrorNotice error={error} onRetry={reload} />
  if (!data) {
    return (
      <>
        <PageHeader title="Transaction" back="/transactions" />
        <ErrorNotice error={{ message: 'Not found' }} />
      </>
    )
  }

  const { t, refunds, original } = data
  const category = categoriesById.get(t.category_id)
  const refunded = refunds.reduce((s, r) => s + r.amount_cents, 0)
  const tone = t.type === 'income' || t.type === 'refund' ? 'text-positive' : 'text-ink'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTransaction(t.id)
      notifyTransactionsChanged()
      toast('Transaction deleted')
      navigate('/transactions', { replace: true })
    } catch (e) {
      toast(friendlyError(e), 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={TYPE_LABELS[t.type]}
        back
        actions={
          <Link
            to={`/transactions/${t.id}/edit`}
            className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold text-ink-soft hover:bg-subtle"
          >
            <Pencil size={15} /> Edit
          </Link>
        }
      />

      <Card className="mb-4 flex flex-col items-center px-5 py-7 text-center">
        <CategoryIconBadge category={category} size="lg" />
        <p className="mt-3 text-sm text-muted">{t.description || category?.name}</p>
        <p className={`tabular mt-1 text-4xl font-semibold tracking-tight ${tone}`}>
          {formatSigned(t.amount_cents, transactionSign(t.type))}
        </p>
        {t.type === 'expense' && refunded > 0 && (
          <p className="mt-2 rounded-full bg-positive-soft px-3 py-1 text-xs font-medium text-positive">
            {formatMoney(t.amount_cents)} − {formatMoney(refunded)} refunded = {formatMoney(t.amount_cents - refunded)} your share
          </p>
        )}
      </Card>

      <Card className="mb-4 divide-y divide-line px-5">
        <Row label="Category">{category?.name ?? '—'}</Row>
        <Row label="Date">{formatDayLabel(t.occurred_on)}</Row>
        {t.description && <Row label="Description">{t.description}</Row>}
        {t.payment_method && <Row label="Paid with">{PAYMENT_LABELS[t.payment_method]}</Row>}
        {t.notes && (
          <div className="py-3">
            <p className="mb-1 text-[13px] text-muted">Notes</p>
            <p className="whitespace-pre-wrap text-sm">{t.notes}</p>
          </div>
        )}
      </Card>

      {t.type === 'refund' && (
        <Card className="mb-4 p-3">
          <p className="mb-1 flex items-center gap-1.5 px-2 text-xs font-medium text-muted">
            <Link2 size={13} /> Refund of
          </p>
          {original ? (
            <TransactionRow transaction={original} showDate onClick={() => navigate(`/transactions/${original.id}`)} />
          ) : (
            <p className="px-2 pb-1 text-sm text-muted">Not linked to a specific expense.</p>
          )}
        </Card>
      )}

      {t.type === 'expense' && (
        <Card className="mb-4 p-3">
          <div className="mb-1 flex items-center justify-between px-2">
            <p className="text-xs font-medium text-muted">Refunds</p>
            <Link to={`/transactions/new?type=refund&refundOf=${t.id}`} className="flex items-center gap-1 text-[13px] font-semibold text-brand">
              <Plus size={14} /> Add refund
            </Link>
          </div>
          {refunds.length ? (
            refunds.map((r) => <TransactionRow key={r.id} transaction={r} showDate onClick={() => navigate(`/transactions/${r.id}`)} />)
          ) : (
            <p className="px-2 pb-1 text-sm text-muted">Did someone pay you back? Add a refund to track your real share.</p>
          )}
        </Card>
      )}

      <Button variant="danger-soft" className="w-full" onClick={() => setConfirmOpen(true)}>
        <Trash2 size={16} /> Delete transaction
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete transaction?"
        message={
          refunds.length
            ? `This expense has ${refunds.length} linked refund${refunds.length > 1 ? 's' : ''}. They will be kept, but no longer linked to it. This can't be undone.`
            : "This can't be undone."
        }
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
