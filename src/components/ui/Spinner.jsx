import { LoaderCircle } from 'lucide-react'

export default function Spinner({ className = '', label = 'Loading' }) {
  return (
    <div className={`flex items-center justify-center py-10 text-muted ${className}`} role="status" aria-label={label}>
      <LoaderCircle size={22} className="animate-spin" />
    </div>
  )
}
