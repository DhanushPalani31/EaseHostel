import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal.jsx';

/**
 * ConfirmDialog – modal confirmation for destructive actions.
 */
const ConfirmDialog = memo(({
  open,
  onClose,
  onConfirm,
  title        = 'Are you sure?',
  description  = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',   // danger | warning
  loading      = false
}) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="flex flex-col items-center text-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
        ${variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
        <AlertTriangle size={22} className={variant === 'danger' ? 'text-red-500' : 'text-amber-500'} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-1">{title}</h3>
        <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={onClose} className="btn-outline btn-md flex-1">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`btn-md flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-accent'}`}
        >
          {loading
            ? <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait…
              </span>
            : confirmLabel
          }
        </button>
      </div>
    </div>
  </Modal>
));

ConfirmDialog.displayName = 'ConfirmDialog';
export default ConfirmDialog;
