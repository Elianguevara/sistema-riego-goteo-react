// src/pages/UserManagementView.tsx

import type { UserResponse, UserCreateData, UserUpdateData, PasswordUpdateData } from '../types/user.types';
import type { Page } from '../types/audit.types';
import UserForm from '../components/users/UserForm';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import StatusToggle from '../components/ui/StatusToggle';
import ActionsMenu from '../components/ui/ActionsMenu';
import ChangePasswordModal from '../components/users/ChangePasswordModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { ArrowUpDown, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import './UserManagement.css';

export type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

interface UserManagementViewProps {
    users: UserResponse[];
    usersPage: Page<UserResponse> | undefined;
    isFetching: boolean;
    sort: SortConfig;
    isFormModalOpen: boolean;
    currentUser: UserResponse | null;
    isPasswordModalOpen: boolean;
    userForPasswordChange: UserResponse | null;
    userToDelete: UserResponse | null;
    isFormSaving: boolean;
    isPasswordSaving: boolean;
    isDeleting: boolean;
    onOpenCreateForm: () => void;
    onOpenEditForm: (user: UserResponse) => void;
    onSaveForm: (data: UserCreateData | UserUpdateData) => void;
    onCloseFormModal: () => void;
    onOpenPasswordModal: (user: UserResponse) => void;
    onClosePasswordModal: () => void;
    onPasswordSave: (data: PasswordUpdateData) => void;
    onOpenDeleteModal: (user: UserResponse) => void;
    onCloseDeleteModal: () => void;
    onConfirmDelete: () => void;
    onUpdateUserStatus: (userId: number, active: boolean) => void;
    isStatusUpdating: (userId: number) => boolean;
    onSort: (key: string) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
}

const UserManagementView = ({
    users,
    usersPage,
    isFetching,
    sort,
    isFormModalOpen,
    currentUser,
    isPasswordModalOpen,
    userForPasswordChange,
    userToDelete,
    isFormSaving,
    isPasswordSaving,
    isDeleting,
    onOpenCreateForm,
    onOpenEditForm,
    onSaveForm,
    onCloseFormModal,
    onOpenPasswordModal,
    onClosePasswordModal,
    onPasswordSave,
    onOpenDeleteModal,
    onCloseDeleteModal,
    onConfirmDelete,
    onUpdateUserStatus,
    isStatusUpdating,
    onSort,
    onPrevPage,
    onNextPage,
}: UserManagementViewProps) => {
    const renderSortIcon = (key: string) => {
        if (sort.key !== key) return <ArrowUpDown size={14} className="sort-icon" />;
        if (sort.direction === 'asc') return <ChevronUp size={14} className="sort-icon" />;
        return <ChevronDown size={14} className="sort-icon" />;
    };

    return (
        <div className="user-management-page">
            <PageHeader
                title="Usuarios"
                action={
                    <button className="create-user-btn" onClick={onOpenCreateForm}>
                        <Plus size={16} /> Crear Usuario
                    </button>
                }
            />

            <div className="user-table-container">
                <table>
                    <thead>
                        <tr>
                            <th className="sortable-header" onClick={() => onSort('name')}>Nombre {renderSortIcon('name')}</th>
                            <th className="sortable-header" onClick={() => onSort('username')}>Username {renderSortIcon('username')}</th>
                            <th className="sortable-header" onClick={() => onSort('email')}>Email {renderSortIcon('email')}</th>
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
                                        isLoading={isStatusUpdating(user.id)}
                                        onChange={() => onUpdateUserStatus(user.id, !user.active)}
                                    />
                                </td>
                                <td className="actions">
                                    <ActionsMenu
                                        items={[
                                            { label: 'Editar', action: () => onOpenEditForm(user) },
                                            { label: 'Cambiar Contraseña', action: () => onOpenPasswordModal(user) },
                                            { label: 'Eliminar', action: () => onOpenDeleteModal(user), className: 'delete' },
                                        ]}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {usersPage && usersPage.totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={onPrevPage} disabled={usersPage.first || isFetching}>
                        Anterior
                    </button>
                    <span>Página {usersPage.number + 1} de {usersPage.totalPages}</span>
                    <button onClick={onNextPage} disabled={usersPage.last || isFetching}>
                        Siguiente
                    </button>
                </div>
            )}

            <Modal isOpen={isFormModalOpen} onClose={onCloseFormModal}>
                <UserForm
                    currentUser={currentUser}
                    onSave={onSaveForm}
                    onCancel={onCloseFormModal}
                    isLoading={isFormSaving}
                />
            </Modal>

            {isPasswordModalOpen && userForPasswordChange && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={onClosePasswordModal}
                    onSave={onPasswordSave}
                    isLoading={isPasswordSaving}
                    userName={userForPasswordChange.name}
                />
            )}

            {userToDelete && (
                <ConfirmationModal
                    message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={onConfirmDelete}
                    onCancel={onCloseDeleteModal}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
};

export default UserManagementView;
