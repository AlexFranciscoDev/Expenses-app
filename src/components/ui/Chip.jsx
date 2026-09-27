export default function Chip({ active = false, onClick, children, className = '', ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-ink-soft hover:bg-subtle'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
