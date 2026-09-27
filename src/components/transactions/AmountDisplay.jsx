import { splitForDisplay } from '../../utils/amountInput.js'

const TONES = {
  expense: 'text-ink',
  income: 'text-positive',
  refund: 'text-positive',
  transfer: 'text-ink',
}

export default function AmountDisplay({ value, type, active, onClick }) {
  const { int, dec } = splitForDisplay(value)
  const empty = !value
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Amount"
      className="flex w-full items-baseline justify-center gap-1 py-4"
    >
      <span className={`text-3xl font-semibold ${empty ? 'text-muted/50' : 'text-muted'}`}>€</span>
      <span className={`tabular text-5xl font-semibold tracking-tight ${empty ? 'text-muted/40' : TONES[type]}`}>
        {int}
        <span className={empty ? '' : 'text-muted'}>{dec}</span>
      </span>
      {active && <span className="ml-0.5 h-10 w-[2px] animate-pulse self-center rounded bg-brand" />}
    </button>
  )
}
