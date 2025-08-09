import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService from '../services/adminService';
import type { UserResponse, UserCreateData, UserUpdateData, PasswordUpdateData } from '../types/user.types';
import UserForm from '../components/users/UserForm';
import StatusToggle from '../components/ui/StatusToggle';
import ActionsMenu, { type ActionMenuItem } from '../components/ui/ActionsMenu';import ChangePasswordModal from '../components/users/ChangePasswordModal';
import './UserManagement.css';

// Componente para el modal de confirmación de borrado
const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading }: { message: string, onConfirm: () => void, onCancel: () => void, isLoading: boolean }) => (
    <div className="modal-overlay">
        <div className="modal-container">
            <h3>Confirmación Requerida</h3>
            <p>{message}</p>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={onCancel} disabled={isLoading}>Cancelar</button>
                <button className="btn-delete" onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? 'Eliminando...' : 'Confirmar'}
                </button>
            </div>
        </div>
    </div>
);


const UserManagement = () => {
    const queryClient = useQueryClient();

    // --- ESTADOS PARA GESTIONAR MODALES Y USUARIOS SELECCIONADOS ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userForPasswordChange, setUserForPasswordChange] = useState<UserResponse | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);

    // --- OBTENCIÓN DE DATOS ---
    const { data: users = [], isLoading, isError, error } = useQuery<UserResponse[]>({
        queryKey: ['users'],
        queryFn: adminService.getUsers,
    });

    // --- LÓGICA DE MUTACIONES (Crear, Editar, Borrar, etc.) ---

    // Función genérica para manejar errores de mutación
    const handleMutationError = (error: Error, defaultMessage: string) => {
        console.error(error);
        toast.error(error.message || defaultMessage);
    };

    const createUserMutation = useMutation({
        mutationFn: adminService.createUser,
        onSuccess: () => {
            toast.success('Usuario creado exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsFormModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al crear el usuario.'),
    });

    const updateUserMutation = useMutation({
        mutationFn: (variables: { id: number; data: UserUpdateData }) => adminService.updateUser(variables.id, variables.data),
        onSuccess: () => {
            toast.success('Usuario actualizado exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsFormModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al actualizar el usuario.'),
    });

    const deleteUserMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            toast.success('Usuario eliminado exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setUserToDelete(null); // Cierra el modal de confirmación
        },
        onError: (err) => handleMutationError(err, 'Error al eliminar el usuario.'),
    });

    const updateUserStatusMutation = useMutation({
        mutationFn: (variables: { id: number; data: { active: boolean } }) => adminService.updateUserStatus(variables.id, variables.data),
        onSuccess: () => {
            toast.success('Estado del usuario actualizado.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => handleMutationError(err, 'Error al cambiar el estado.'),
    });

    const changePasswordMutation = useMutation({
        mutationFn: (variables: { id: number; data: PasswordUpdateData }) => adminService.changeUserPassword(variables.id, variables.data),
        onSuccess: (successMessage) => {
            toast.success(successMessage);
            setIsPasswordModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al cambiar la contraseña.'),
    });


    // --- MANEJADORES DE EVENTOS PARA ABRIR MODALES ---
    const handleOpenCreateForm = () => {
        setCurrentUser(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditForm = (user: UserResponse) => {
        setCurrentUser(user);
        setIsFormModalOpen(true);
    };

    const handleOpenPasswordModal = (user: UserResponse) => {
        setUserForPasswordChange(user);
        setIsPasswordModalOpen(true);
    };
    
    const handleOpenDeleteModal = (user: UserResponse) => {
        setUserToDelete(user);
    };


    // --- MANEJADORES DE ACCIONES ---
    const handleSaveForm = (data: UserCreateData | UserUpdateData) => {
        if (currentUser) {
            updateUserMutation.mutate({ id: currentUser.id, data: data as UserUpdateData });
        } else {
            createUserMutation.mutate(data as UserCreateData);
        }
    };
    
    const handleConfirmDelete = () => {
        if (userToDelete) {
            deleteUserMutation.mutate(userToDelete.id);
        }
    };

    const handlePasswordSave = (passwordData: PasswordUpdateData) => {
        if (userForPasswordChange) {
            changePasswordMutation.mutate({ id: userForPasswordChange.id, data: passwordData });
        }
    };

    // --- RENDERIZADO DEL COMPONENTE ---
    if (isLoading) return <div className="user-management-page"><p>Cargando usuarios...</p></div>;
    if (isError) return <div className="user-management-page"><p className="error-text">Error: {error.message}</p></div>;

    return (
        <div className="user-management-page">
            <div className="page-header">
                <h1>Usuarios</h1>
                <button className="create-user-btn" onClick={handleOpenCreateForm}>
                    <i className="fas fa-plus"></i> Crear Usuario
                </button>
            </div>

            <div className="user-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.roleName}</td>
                                <td>
                                    <StatusToggle
                                        isActive={user.active}
                                        isLoading={updateUserStatusMutation.isPending && updateUserStatusMutation.variables?.id === user.id}
                                        onChange={() => updateUserStatusMutation.mutate({ id: user.id, data: { active: !user.active } })}
                                    />
                                </td>
                                <td className="actions">
                                     <ActionsMenu
                                             items={[
                                                { label: 'Editar', action: () => handleOpenEditForm(user) },
                                                { label: 'Cambiar Contraseña', action: () => handleOpenPasswordModal(user) },
                                                { label: 'Eliminar', action: () => handleOpenDeleteModal(user), className: 'delete' }
                                        ]}
    />
</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- RENDERIZADO CONDICIONAL DE MODALES --- */}
            {isFormModalOpen && (
                 <div className="modal-overlay">
                    <UserForm
                        currentUser={currentUser}
                        onSave={handleSaveForm}
                        onCancel={() => setIsFormModalOpen(false)}
                        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
                    />
                </div>
            )}

            {isPasswordModalOpen && userForPasswordChange && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSave={handlePasswordSave}
                    isLoading={changePasswordMutation.isPending}
                    userName={userForPasswordChange.name}
                />
            )}
            
            {userToDelete && (
                <ConfirmationModal
                    message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setUserToDelete(null)}
                    isLoading={deleteUserMutation.isPending}
                />
            )}
        </div>
    );
};

export default UserManagement;