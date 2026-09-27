import { Input } from './Field.jsx'

export default function MoneyInput({ value, onChange, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-muted">€</span>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        className="tabular pl-8"
        autoComplete="off"
        {...props}
      />
    </div>
  )
}
