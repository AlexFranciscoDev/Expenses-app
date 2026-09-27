import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/** Bottom sheet on mobile, centered dialog on larger screens */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const width = size === 'lg' ? 'sm:max-w-lg' : 'sm:max-w-md'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`animate-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-surface shadow-float sm:rounded-3xl ${width}`}>
        {title && (
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h2 className="text-base font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-subtle">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 pb-safe sm:pb-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
