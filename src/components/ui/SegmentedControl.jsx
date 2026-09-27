export default function SegmentedControl({ options, value, onChange, className = '', size = 'md' }) {
  const pad = size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-[13px]'
  return (
    <div role="tablist" className={`flex rounded-2xl bg-subtle p-1 ${className}`}>
      {options.map((option) => {
        const active = option.key === value
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
            className={`flex-1 rounded-xl px-2 font-semibold transition-all ${pad} ${
              active ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink-soft'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
