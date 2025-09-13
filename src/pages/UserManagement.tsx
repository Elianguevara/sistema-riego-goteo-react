// src/pages/UserManagement.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService from '../services/adminService';
import type { UserResponse, UserCreateData, UserUpdateData, PasswordUpdateData } from '../types/user.types';
import type { Page } from '../types/audit.types'; // Importamos el tipo Page
import UserForm from '../components/users/UserForm';
import StatusToggle from '../components/ui/StatusToggle';
import ActionsMenu, { type ActionMenuItem } from '../components/ui/ActionsMenu';
import ChangePasswordModal from '../components/users/ChangePasswordModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import './UserManagement.css';

// Tipo para la configuración del ordenamiento
type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

const UserManagement = () => {
    const queryClient = useQueryClient();

    // --- ESTADOS PARA GESTIONAR MODALES Y USUARIOS SELECCIONADOS ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userForPasswordChange, setUserForPasswordChange] = useState<UserResponse | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);

    // --- NUEVOS ESTADOS PARA PAGINACIÓN Y ORDENAMIENTO ---
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(8);
    const [sort, setSort] = useState<SortConfig>({ key: 'name', direction: 'asc' });

    // --- OBTENCIÓN DE DATOS PAGINADOS ---
    const { data: usersPage, isLoading, isError, error, isFetching } = useQuery<Page<UserResponse>, Error>({
        queryKey: ['users', page, size, sort],
        queryFn: () => adminService.getUsers({ page, size, sort: `${sort.key},${sort.direction}` }),
    });

    // --- LÓGICA DE MUTACIONES (Sin cambios) ---
    const handleMutationError = (error: Error, defaultMessage: string) => {
        console.error(error);
        toast.error(error.message || defaultMessage);
    };

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    };

    const createUserMutation = useMutation({
        mutationFn: adminService.createUser,
        ...mutationOptions,
        onSuccess: () => {
            toast.success('Usuario creado exitosamente.');
            mutationOptions.onSuccess();
            setIsFormModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al crear el usuario.'),
    });

    const updateUserMutation = useMutation({
        mutationFn: (variables: { id: number; data: UserUpdateData }) => adminService.updateUser(variables.id, variables.data),
        ...mutationOptions,
        onSuccess: () => {
            toast.success('Usuario actualizado exitosamente.');
            mutationOptions.onSuccess();
            setIsFormModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al actualizar el usuario.'),
    });

    const deleteUserMutation = useMutation({
        mutationFn: adminService.deleteUser,
        ...mutationOptions,
        onSuccess: () => {
            toast.success('Usuario eliminado exitosamente.');
            mutationOptions.onSuccess();
            setUserToDelete(null);
        },
        onError: (err) => handleMutationError(err, 'Error al eliminar el usuario.'),
    });

    const updateUserStatusMutation = useMutation({
        mutationFn: (variables: { id: number; data: { active: boolean } }) => adminService.updateUserStatus(variables.id, variables.data),
        ...mutationOptions,
        onSuccess: () => {
            toast.success('Estado del usuario actualizado.');
            mutationOptions.onSuccess();
        },
        onError: (err) => handleMutationError(err, 'Error al cambiar el estado.'),
    });

    const changePasswordMutation = useMutation({
        mutationFn: (variables: { id: number; data: PasswordUpdateData }) => adminService.changeUserPassword(variables.id, variables.data),
        ...mutationOptions,
        onSuccess: (successMessage: string) => {
            toast.success(successMessage);
            setIsPasswordModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al cambiar la contraseña.'),
    });

    // --- MANEJADORES DE EVENTOS ---
    const handleOpenCreateForm = () => { setCurrentUser(null); setIsFormModalOpen(true); };
    const handleOpenEditForm = (user: UserResponse) => { setCurrentUser(user); setIsFormModalOpen(true); };
    const handleOpenPasswordModal = (user: UserResponse) => { setUserForPasswordChange(user); setIsPasswordModalOpen(true); };
    const handleOpenDeleteModal = (user: UserResponse) => { setUserToDelete(user); };
    const handleSaveForm = (data: UserCreateData | UserUpdateData) => { if (currentUser) { updateUserMutation.mutate({ id: currentUser.id, data: data as UserUpdateData }); } else { createUserMutation.mutate(data as UserCreateData); } };
    const handleConfirmDelete = () => { if (userToDelete) { deleteUserMutation.mutate(userToDelete.id); } };
    const handlePasswordSave = (passwordData: PasswordUpdateData) => { if (userForPasswordChange) { changePasswordMutation.mutate({ id: userForPasswordChange.id, data: passwordData }); } };
    
    // --- NUEVO MANEJADOR PARA ORDENAMIENTO ---
    const handleSort = (key: string) => {
        setSort(prevSort => ({
            key,
            direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }));
        setPage(0); // Volvemos a la primera página al cambiar el orden
    };

    // Helper para renderizar el ícono de ordenamiento
    const renderSortIcon = (key: string) => {
        if (sort.key !== key) return <i className="fas fa-sort sort-icon"></i>;
        if (sort.direction === 'asc') return <i className="fas fa-sort-up sort-icon"></i>;
        return <i className="fas fa-sort-down sort-icon"></i>;
    };

    if (isLoading) return <div className="user-management-page"><p>Cargando usuarios...</p></div>;
    if (isError) return <div className="user-management-page"><p className="error-text">Error: {error.message}</p></div>;
    
    const users = usersPage?.content ?? [];

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
                            <th className="sortable-header" onClick={() => handleSort('name')}>Nombre {renderSortIcon('name')}</th>
                            <th className="sortable-header" onClick={() => handleSort('username')}>Username {renderSortIcon('username')}</th>
                            <th className="sortable-header" onClick={() => handleSort('email')}>Email {renderSortIcon('email')}</th>
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

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {usersPage && usersPage.totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={() => setPage(page - 1)} disabled={usersPage.first || isFetching}>
                        Anterior
                    </button>
                    <span>Página {usersPage.number + 1} de {usersPage.totalPages}</span>
                    <button onClick={() => setPage(page + 1)} disabled={usersPage.last || isFetching}>
                        Siguiente
                    </button>
                </div>
            )}

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