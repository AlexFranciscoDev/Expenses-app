import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TransactionForm from '../components/transactions/TransactionForm.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { createTransaction, getTransaction, updateTransaction } from '../services/transactions.js'

const ADDED = { expense: 'Expense added', income: 'Income added', refund: 'Refund added', transfer: 'Transfer added' }

export default function TransactionFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { notifyTransactionsChanged, loading: dataLoading } = useData()

  const isEditing = Boolean(id)
  const refundOf = params.get('refundOf')

  const { data, loading, error, reload } = useAsync(async () => {
    const transaction = isEditing ? await getTransaction(id) : null
    const linkedId = transaction?.refund_of_id ?? refundOf
    const linkedExpense = linkedId ? await getTransaction(linkedId) : null
    return { transaction, linkedExpense }
  }, [id, refundOf])

  const close = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(isEditing ? `/transactions/${id}` : '/', { replace: true })
  }

  const handleSubmit = async (fields) => {
    if (isEditing) {
      await updateTransaction(id, fields)
      toast('Changes saved')
    } else {
      await createTransaction(fields)
      toast(ADDED[fields.type])
    }
    notifyTransactionsChanged()
    close()
  }

  let content
  if (loading || dataLoading) content = <Spinner className="h-dvh sm:h-96" />
  else if (error) content = <ErrorNotice error={error} onRetry={reload} />
  else if (isEditing && !data.transaction) content = <ErrorNotice error={{ message: 'Not found' }} />
  else {
    const initial = data.transaction ?? {
      type: params.get('type') ?? 'expense',
      category_id: data.linkedExpense?.category_id,
    }
    content = (
      <TransactionForm
        initial={initial}
        initialLinkedExpense={data.linkedExpense}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onClose={close}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-surface sm:flex sm:items-center sm:justify-center sm:bg-canvas sm:p-8">
      <div className="w-full sm:max-w-lg">{content}</div>
    </div>
  )
}
