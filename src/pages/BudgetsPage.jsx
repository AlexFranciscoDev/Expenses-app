import { useState } from 'react'
import BudgetAmountEditor from '../components/budgets/BudgetAmountEditor.jsx'
import CategoryBudgetsSection from '../components/budgets/CategoryBudgetsSection.jsx'
import { BudgetAlert } from '../components/dashboard/BudgetSummaryCard.jsx'
import MonthSelector from '../components/layout/MonthSelector.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { friendlyError } from '../constants/copy.js'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useMonthBudget } from '../hooks/useMonthBudget.js'
import { useMonthTransactions } from '../hooks/useMonthTransactions.js'
import { deleteBudget, saveBudget } from '../services/budgets.js'
import { formatMonth } from '../utils/dates.js'
import { budgetStatus, summarize } from '../utils/finance.js'
import { formatMoney } from '../utils/money.js'

const BAR_TONE = { ok: 'brand', near: 'warning', high: 'warning', reached: 'warning', over: 'negative' }

export default function BudgetsPage() {
  const { month } = useMonth()
  const { reloadBudgets } = useData()
  const toast = useToast()
  const { amount, defaultBudget, override } = useMonthBudget(month)
  const { transactions, loading, data } = useMonthTransactions(month)
  const [editingOverride, setEditingOverride] = useState(false)

  const status = budgetStatus(summarize(transactions).netExpense, amount)
  const monthName = formatMonth(month)

  const removeBudget = async (budget) => {
    try {
      await deleteBudget(budget.id)
      await reloadBudgets()
      toast('Budget removed')
    } catch (e) {
      toast(friendlyError(e), 'error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Budgets" />
      <MonthSelector className="mb-4" />

      <Card className="mb-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly budget · {monthName}</p>
        {loading && !data ? (
          <Spinner className="py-6" />
        ) : status.level === 'none' ? (
          <p className="mt-2 text-sm text-muted">No budget set. Add a default budget below and it will apply to every month.</p>
        ) : (
          <>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="tabular text-[28px] font-semibold tracking-tight">
                {formatMoney(status.spent)} <span className="text-base font-medium text-muted">/ {formatMoney(status.budget)}</span>
              </p>
              <span className="tabular text-sm font-semibold text-ink-soft">{Math.round(status.usedPct)}%</span>
            </div>
            <ProgressBar value={status.usedPct} tone={BAR_TONE[status.level]} className="mt-3" height="h-2.5" />
            <p className="mt-2 text-[13px] text-muted">
              {status.remaining >= 0 ? `${formatMoney(status.remaining)} left` : `${formatMoney(status.overBy)} over`}
              {override ? ' · custom budget for this month' : ''}
            </p>
            <BudgetAlert status={status} />
          </>
        )}
      </Card>

      <Card className="mb-4 flex flex-col gap-5 p-5">
        <BudgetAmountEditor
          key={`default-${defaultBudget?.id ?? 'none'}-${defaultBudget?.amount_cents}`}
          label="Default monthly budget"
          hint="Applies to every month unless you set a custom amount for a specific month."
          initialCents={defaultBudget?.amount_cents}
          onSave={async (cents) => {
            await saveBudget({ amountCents: cents })
            await reloadBudgets()
          }}
        />

        <div className="border-t border-line pt-5">
          {override || editingOverride ? (
            <BudgetAmountEditor
              key={`override-${month}-${override?.amount_cents}`}
              label={`Custom budget for ${monthName}`}
              initialCents={override?.amount_cents ?? defaultBudget?.amount_cents}
              onSave={async (cents) => {
                await saveBudget({ amountCents: cents, month })
                await reloadBudgets()
                setEditingOverride(false)
              }}
              onRemove={override ? () => removeBudget(override) : () => setEditingOverride(false)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Different budget for {monthName}?</p>
                <p className="text-xs text-muted">Useful for holidays or months with extra expenses.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditingOverride(true)}>
                Set
              </Button>
            </div>
          )}
        </div>
      </Card>

      <CategoryBudgetsSection month={month} transactions={transactions} />

      <p className="px-1 text-xs leading-relaxed text-muted">
        Limits cover net spending (expenses minus refunds) for that category. Transfers such as savings or investments never count.
      </p>
    </div>
  )
}
