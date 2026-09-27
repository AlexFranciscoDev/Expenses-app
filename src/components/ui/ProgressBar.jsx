const TONES = {
  brand: 'bg-brand',
  positive: 'bg-positive',
  warning: 'bg-warning',
  negative: 'bg-negative',
  muted: 'bg-muted',
}

export default function ProgressBar({ value = 0, tone = 'brand', color, className = '', height = 'h-2' }) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full overflow-hidden rounded-full bg-line ${height} ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${color ? '' : TONES[tone]}`}
        style={{ width: `${width}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
    </div>
  )
}
