import { Delete } from 'lucide-react'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back']

export default function AmountKeypad({ onKey }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          aria-label={key === 'back' ? 'Delete' : key === '.' ? 'Decimal point' : key}
          className="flex h-12 items-center justify-center rounded-2xl bg-subtle text-xl font-medium text-ink transition-colors active:bg-line"
        >
          {key === 'back' ? <Delete size={22} /> : key}
        </button>
      ))}
    </div>
  )
}
