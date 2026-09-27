export default function IconButton({ label, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:bg-subtle ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
