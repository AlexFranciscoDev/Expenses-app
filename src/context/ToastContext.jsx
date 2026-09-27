import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const show = useCallback((message, tone = 'success') => {
    clearTimeout(timer.current)
    setToast({ message, tone, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-safe">
          <div
            key={toast.id}
            role="status"
            className="animate-sheet mt-3 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-float"
          >
            {toast.tone === 'error' ? (
              <CircleAlert size={16} className="text-negative" />
            ) : (
              <CircleCheck size={16} className="text-green-400" />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
