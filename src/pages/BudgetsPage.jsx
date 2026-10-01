import { useMemo, useState } from 'react'
import BudgetAmountEditor from '../components/budgets/BudgetAmountEditor.jsx'
import CategoryBudgetsSection from '../components/budgets/CategoryBudgetsSection.jsx'
import { BudgetAlert } from '../components/dashboard/BudgetSummaryCard.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PeriodSelector from '../components/layout/PeriodSelector.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { budgetTailNote, friendlyError } from '../constants/copy.js'
import { useData } from '../context/DataContext.jsx'
import { useMonth } from '../context/MonthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useMonthBudget } from '../hooks/useMonthBudget.js'
import { usePeriodSummaries } from '../hooks/usePeriodSummaries.js'
import { deleteBudget, saveBudget } from '../services/budgets.js'
import { payCycleTailBeforeMonth } from '../utils/dates.js'
import { budgetStatus, netExpenseInRange, summarize } from '../utils/finance.js'
import { formatMoney } from '../utils/money.js'

const BAR_TONE = { ok: 'brand', near: 'warning', high: 'warning', reached: 'warning', over: 'negative' }

export default function BudgetsPage() {
  const { payday, periodMode, range, rangeLabel } = useMonth()
  const { reloadBudgets } = useData()
  const toast = useToast()

  const isCycle = periodMode === 'payday'
  const periodType = isCycle ? 'payday' : 'calendar'
  const periodKey = isCycle ? range.start : range.start.slice(0, 7)
  const periodLabel = isCycle ? 'pay cycle' : 'month'

  const { amount, defaultBudget, override } = useMonthBudget(periodKey, null, periodType)
  // count=2 so the previous calendar month's tail (if any) is already in `data`.
  const { periodTransactions, loading, data } = usePeriodSummaries(2)
  const [editingOverride, setEditingOverride] = useState(false)

  const tail = !isCycle && payday ? payCycleTailBeforeMonth(payday, periodKey) : null
  const tailTransactions = useMemo(
    () => (tail ? (data ?? []).filter((t) => t.occurred_on >= tail.start && t.occurred_on <= tail.end) : []),
    [data, tail],
  )
  const tailNet = netExpenseInRange(data ?? [], tail)
  const status = budgetStatus(summarize(periodTransactions).netExpense + tailNet, amount)
  const tailNote = budgetTailNote(tailNet, tail)

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
      <PeriodSelector className="mb-4" />

      <Card className="mb-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted capitalize">
          {periodLabel} budget · {rangeLabel}
        </p>
        {loading && !data ? (
          <Spinner className="py-6" />
        ) : status.level === 'none' ? (
          <p className="mt-2 text-sm text-muted">No budget set. Add a default budget below and it will apply to every {periodLabel}.</p>
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
              {override ? ` · custom budget for this ${periodLabel}` : ''}
            </p>
            {tailNote && <p className="mt-2 text-[12px] text-muted">{tailNote}</p>}
            <BudgetAlert status={status} subject={isCycle ? 'your pay-cycle budget' : undefined} />
          </>
        )}
      </Card>

      <Card className="mb-4 flex flex-col gap-5 p-5">
        <BudgetAmountEditor
          key={`default-${periodType}-${defaultBudget?.id ?? 'none'}-${defaultBudget?.amount_cents}`}
          label={isCycle ? 'Default pay-cycle budget' : 'Default monthly budget'}
          hint={`Applies to every ${periodLabel} unless you set a custom amount for a specific one.`}
          initialCents={defaultBudget?.amount_cents}
          onSave={async (cents) => {
            await saveBudget({ amountCents: cents, periodType })
            await reloadBudgets()
          }}
        />

        <div className="border-t border-line pt-5">
          {override || editingOverride ? (
            <BudgetAmountEditor
              key={`override-${periodType}-${periodKey}-${override?.amount_cents}`}
              label={`Custom budget for ${rangeLabel}`}
              initialCents={override?.amount_cents ?? defaultBudget?.amount_cents}
              onSave={async (cents) => {
                await saveBudget({ amountCents: cents, month: periodKey, periodType })
                await reloadBudgets()
                setEditingOverride(false)
              }}
              onRemove={override ? () => removeBudget(override) : () => setEditingOverride(false)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Different budget for {rangeLabel}?</p>
                <p className="text-xs text-muted">Useful for a {periodLabel} with extra expenses, like holidays.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditingOverride(true)}>
                Set
              </Button>
            </div>
          )}
        </div>
      </Card>

      <CategoryBudgetsSection
        periodKey={periodKey}
        periodType={periodType}
        rangeLabel={rangeLabel}
        transactions={periodTransactions}
        tailTransactions={tailTransactions}
      />

      <p className="px-1 text-xs leading-relaxed text-muted">
        Limits cover net spending (expenses minus refunds) for that category. Transfers such as savings or investments never count.
        {!isCycle && payday && ' In Calendar month, they also include anything spent after payday but before the month started.'}
      </p>
    </div>
  )
}
