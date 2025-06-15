import React, { useState, useEffect } from 'react';
import type { UserResponse, UserCreateData } from '../../types/user.types';
import './UserForm.css';

interface UserFormProps {
    currentUser: UserResponse | null;
    onSave: (user: UserCreateData) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ currentUser, onSave, onCancel }) => {
    const [formData, setFormData] = useState<UserCreateData>({
        name: '',
        username: '',
        password: '',
        email: '',
        rol: 'OPERARIO',
    });

    const isEditing = currentUser !== null;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: currentUser.name,
                username: currentUser.username,
                email: currentUser.email,
                rol: currentUser.roleName as 'ANALISTA' | 'OPERARIO',
                password: '' // La contraseña no se precarga por seguridad
            });
        } else {
            // Resetea el formulario para modo creación
            setFormData({ name: '', username: '', password: '', email: '', rol: 'OPERARIO' });
        }
    }, [currentUser, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h3>
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
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
                        <select id="rol" name="rol" value={formData.rol} onChange={handleChange}>
                            <option value="ANALISTA">Analista</option>
                            <option value="OPERARIO">Operario</option>
                        </select>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-save">Guardar</button>
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;