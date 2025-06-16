import React, { useState, useEffect } from 'react';
// Importamos todos los tipos que usaremos para mayor claridad
import type { UserResponse, UserCreateData, UserUpdateData } from '../../types/user.types';
import './UserForm.css';

interface UserFormProps {
    currentUser: UserResponse | null;
    // La función onSave es ahora más inteligente y recibirá el tipo de dato correcto
    onSave: (data: UserCreateData | UserUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean; // Prop para saber si una operación está en curso
}

const UserForm: React.FC<UserFormProps> = ({ currentUser, onSave, onCancel, isLoading }) => {
    // Usamos UserCreateData como el estado base del formulario
    const [formData, setFormData] = useState<UserCreateData>({
        name: '',
        username: '',
        password: '',
        email: '',
        rol: 'OPERARIO',
    });

    const isEditing = currentUser !== null;

    // Este efecto se encarga de rellenar o resetear el formulario
    useEffect(() => {
        if (isEditing && currentUser) {
            setFormData({
                name: currentUser.name,
                username: currentUser.username,
                email: currentUser.email,
                // Aseguramos que el rol sea uno de los valores permitidos
                rol: (currentUser.roleName as 'ADMIN' | 'ANALISTA' | 'OPERARIO') || 'OPERARIO',
                password: '' 
            });
        } else {
            // Resetea el formulario para el modo de creación
            setFormData({ name: '', username: '', password: '', email: '', rol: 'OPERARIO' });
        }
    }, [currentUser, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * MEJORA CLAVE:
     * El manejador del submit ahora diferencia entre crear y editar para enviar
     * solo los campos necesarios a la API.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            // Si estamos editando, creamos un objeto con solo los campos de actualización
            const updateData: UserUpdateData = {
                name: formData.name,
                email: formData.email,
            };
            onSave(updateData);
        } else {
            // Si estamos creando, enviamos el formulario completo
            onSave(formData);
        }
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
                    
                    {/* El campo de contraseña solo aparece en modo creación */}
                    {!isEditing && (
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="rol">Rol</label>
                        {/* El rol no se puede editar una vez creado, según la API */}
                        <select id="rol" name="rol" value={formData.rol} onChange={handleChange} disabled={isEditing}>
                            <option value="ANALISTA">Analista</option>
                            <option value="OPERARIO">Operario</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>
                </div>

                {/* MEJORA UX: Los botones se deshabilitan mientras se guarda */}
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