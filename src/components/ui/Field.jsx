export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted">
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

export function Input({ className = '', ...props }) {
  return <input className={`${inputClass} h-11 ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputClass} min-h-20 resize-none ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputClass} h-11 appearance-none ${className}`} {...props}>
      {children}
    </select>
  )
}
