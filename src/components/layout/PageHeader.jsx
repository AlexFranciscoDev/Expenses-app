import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, back, actions }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 pb-4 pt-5 xl:pt-4">
      {back && (
        <button
          type="button"
          onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
          aria-label="Back"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft hover:bg-subtle"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] font-semibold tracking-tight xl:text-2xl">{title}</h1>
        {subtitle && <p className="truncate text-[13px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
