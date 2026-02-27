import React, { useState } from 'react';
import type { UserResponse } from '../../types/user.types';
import '../users/UserForm.css';
import Modal from '../ui/Modal';

interface AssignUserFormProps {
    // Lista de usuarios que aún NO están asignados a la finca
    availableUsers: UserResponse[];
    onSave: (userId: number) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const AssignUserForm: React.FC<AssignUserFormProps> = ({ availableUsers, onSave, onCancel, isLoading }) => {
    // Inicializa con el primer usuario disponible, si existe
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
        availableUsers[0]?.id
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUserId) {
            onSave(selectedUserId);
        } else {
            alert("Por favor, seleccione un usuario.");
        }
    };

    return (
        <Modal isOpen={true} onClose={onCancel}>
            <h3>Asignar Usuario a Finca</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="userId">Usuario</label>
                    <select
                        id="userId"
                        name="userId"
                        value={selectedUserId || ''}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    >
                        {availableUsers.length > 0 ? (
                            availableUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.username})
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No hay usuarios disponibles para asignar</option>
                        )}
                    </select>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-save" disabled={!selectedUserId || isLoading}>
                        {isLoading ? 'Asignando...' : 'Asignar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignUserForm;
