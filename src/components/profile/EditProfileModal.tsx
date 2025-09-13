// src/components/profile/EditProfileModal.tsx

import { useState, useEffect } from 'react';
import type { UserResponse, UserUpdateData } from '../../types/user.types';
import '../users/ChangePasswordModal.css'; // Reutilizamos estilos de modales existentes

interface Props {
    currentUser: UserResponse;
    onClose: () => void;
    onSave: (data: UserUpdateData) => void;
    isLoading: boolean;
}

const EditProfileModal = ({ currentUser, onClose, onSave, isLoading }: Props) => {
    // 1. Estado local con nombre y apellido separados
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: currentUser.email,
    });

    // 2. Efecto para separar el nombre completo al abrir el modal
    useEffect(() => {
        const nameParts = currentUser.name.split(' ');
        const firstName = nameParts.shift() || '';
        const lastName = nameParts.join(' ');
        setFormData({
            firstName,
            lastName,
            email: currentUser.email
        });
    }, [currentUser]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 3. Unimos nombre y apellido antes de guardar
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        onSave({
            name: fullName,
            email: formData.email,
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Editar Perfil</h3>
                <form onSubmit={handleSubmit}>
                    {/* 4. Nuevos campos en la interfaz */}
                    <div className="form-group">
                        <label htmlFor="firstName">Nombre</label>
                        <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Apellido</label>
                        <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
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