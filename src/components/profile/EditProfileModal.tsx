import { useState } from 'react';
import type { UserResponse, UserUpdateData } from '../../types/user.types';
import '../users/ChangePasswordModal.css'; // Reutilizamos estilos de modales existentes

interface Props {
    currentUser: UserResponse;
    onClose: () => void;
    onSave: (data: UserUpdateData) => void;
    isLoading: boolean;
}

const EditProfileModal = ({ currentUser, onClose, onSave, isLoading }: Props) => {
    const [formData, setFormData] = useState<UserUpdateData>({
        name: currentUser.name,
        email: currentUser.email,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Editar Perfil</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;