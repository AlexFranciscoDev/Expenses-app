import Button from './Button.jsx'
import Modal from './Modal.jsx'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {message && <p className="text-sm leading-relaxed text-muted">{message}</p>}
      {children}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
