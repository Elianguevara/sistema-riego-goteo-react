import { useState } from 'react';
import type { PasswordUpdateData } from '../../types/user.types';
import '../users/UserForm.css';
import Modal from '../ui/Modal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PasswordUpdateData) => void;
  isLoading: boolean;
  userName: string;
}

const ChangePasswordModal = ({ isOpen, onClose, onSave, isLoading, userName }: ChangePasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert('La contraseña no puede estar vacía.');
      return;
    }
    onSave({ newPassword });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <h3>Cambiar Contraseña para {userName}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Introduce la nueva contraseña"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Contraseña'}
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default ChangePasswordModal;