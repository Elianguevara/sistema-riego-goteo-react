// src/components/users/UserForm.tsx

import React, { useState, useEffect } from 'react';
import type { UserResponse, UserCreateData, UserUpdateData } from '../../types/user.types';
import './UserForm.css';

interface UserFormProps {
    currentUser: UserResponse | null;
    onSave: (data: UserCreateData | UserUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ currentUser, onSave, onCancel, isLoading }) => {
    // 1. Estado local con nombre y apellido separados
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        email: '',
        rol: 'OPERARIO' as 'ADMIN' | 'ANALISTA' | 'OPERARIO',
    });

    const isEditing = currentUser !== null;

    useEffect(() => {
        if (isEditing && currentUser) {
            // 2. Al editar, separamos el nombre completo en nombre y apellido
            const nameParts = currentUser.name.split(' ');
            const firstName = nameParts.shift() || '';
            const lastName = nameParts.join(' ');

            setFormData({
                firstName: firstName,
                lastName: lastName,
                username: currentUser.username,
                email: currentUser.email,
                rol: currentUser.roleName as 'ADMIN' | 'ANALISTA' | 'OPERARIO',
                password: '' 
            });
        } else {
            // Resetea el formulario para el modo de creación
            setFormData({ firstName: '', lastName: '', username: '', password: '', email: '', rol: 'OPERARIO' });
        }
    }, [currentUser, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 3. Unimos nombre y apellido antes de enviar
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        if (isEditing) {
            const updateData: UserUpdateData = {
                name: fullName,
                email: formData.email,
            };
            onSave(updateData);
        } else {
            const createData: UserCreateData = {
                name: fullName,
                username: formData.username,
                password: formData.password,
                email: formData.email,
                rol: formData.rol,
            };
            onSave(createData);
        }
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h3>
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-grid">
                    {/* 4. Nuevos campos en la interfaz */}
                    <div className="form-group">
                        <label htmlFor="firstName">Nombre</label>
                        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Apellido</label>
                        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required disabled={isEditing} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    
                    {!isEditing && (
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="rol">Rol</label>
                        <select id="rol" name="rol" value={formData.rol} onChange={handleChange} disabled={isEditing}>
                            <option value="ANALISTA">Analista</option>
                            <option value="OPERARIO">Operario</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;