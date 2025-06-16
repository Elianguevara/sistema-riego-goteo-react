import { useState } from 'react';
import type { SelfPasswordUpdateData } from '../../types/user.types';
import '../users/ChangePasswordModal.css'; // Reutilizamos estilos
import { toast } from 'sonner';

interface Props {
    onClose: () => void;
    onSave: (data: SelfPasswordUpdateData) => void;
    isLoading: boolean;
}

const ChangeSelfPasswordModal = ({ onClose, onSave, isLoading }: Props) => {
    const [formData, setFormData] = useState<SelfPasswordUpdateData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('La nueva contraseña y su confirmación no coinciden.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Cambiar Contraseña</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Contraseña Actual</label>
                        <input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangeSelfPasswordModal;