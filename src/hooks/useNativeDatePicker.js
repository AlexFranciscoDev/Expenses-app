import { useRef } from 'react'

/**
 * Drives a hidden native `<input type="date">` from a styled button.
 * `showPicker()` opens the calendar directly; `.focus()` is the fallback for
 * browsers without it (iOS Safari still opens its wheel picker on focus).
 */
export function useNativeDatePicker() {
  const ref = useRef(null)

  const open = () => {
    const input = ref.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        // fall through to focus()
      }
    }
    input.focus()
  }

  return { ref, open }
}
