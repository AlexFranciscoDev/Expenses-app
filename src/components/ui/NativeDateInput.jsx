/**
 * Transparent native `<input type="date">` stretched over its parent (which
 * must be `relative`). The user taps the real input, so every mobile browser
 * opens its own picker; programmatic `showPicker()` on a hidden input is
 * unreliable on real phones. `showPicker()` is still called on click so
 * desktop browsers open the calendar instead of focusing a date segment.
 */
export default function NativeDateInput({ onOpen, ...props }) {
  const open = (e) => {
    try {
      e.currentTarget.showPicker?.()
    } catch {
      // already open, or unsupported: the native tap behaviour takes over
    }
  }

  return (
    <input
      type="date"
      onClick={open}
      onFocus={onOpen}
      className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      {...props}
    />
  )
}
