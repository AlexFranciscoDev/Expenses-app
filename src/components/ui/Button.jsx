import { LoaderCircle } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-600 active:bg-brand-600 shadow-[0_6px_16px_rgb(47_107_255/0.28)]',
  dark: 'bg-ink text-white hover:bg-ink-soft',
  secondary: 'bg-surface text-ink border border-line hover:bg-subtle',
  ghost: 'bg-transparent text-ink-soft hover:bg-subtle',
  danger: 'bg-negative text-white hover:opacity-90',
  'danger-soft': 'bg-negative-soft text-negative hover:opacity-90',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-sm rounded-xl',
  md: 'h-11 px-4 text-sm rounded-2xl',
  lg: 'h-13 px-5 text-[15px] rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
