import { CircleAlert } from 'lucide-react'
import { friendlyError } from '../../constants/copy.js'
import Button from './Button.jsx'

export default function ErrorNotice({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <CircleAlert className="text-negative" size={22} />
      <p className="text-sm text-muted">{friendlyError(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
