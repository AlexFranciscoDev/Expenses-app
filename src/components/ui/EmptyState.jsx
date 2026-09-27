export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle text-muted">
          <Icon size={22} />
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {message && <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
