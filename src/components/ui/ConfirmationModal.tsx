// src/components/ui/ConfirmationModal.tsx

import Modal from './Modal';
import './ConfirmationModal.css';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  confirmText?: string;
  cancelText?: string;
  title?: string;
}

const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  title = 'Confirmación Requerida'
}: Props) => (
    <Modal isOpen={true} onClose={onCancel} size="sm" className="confirmation-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel} disabled={isLoading}>
                {cancelText}
            </button>
            <button className="btn-delete" onClick={onConfirm} disabled={isLoading}>
                {isLoading ? 'Procesando...' : confirmText}
            </button>
        </div>
    </Modal>
);

export default ConfirmationModal;
