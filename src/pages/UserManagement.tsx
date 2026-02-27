// src/pages/UserManagement.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService from '../services/adminService';
import type { UserResponse, UserCreateData, UserUpdateData, PasswordUpdateData } from '../types/user.types';
import type { Page } from '../types/audit.types';
import UserManagementView, { type SortConfig } from './UserManagementView';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

const UserManagement = () => {
    const queryClient = useQueryClient();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userForPasswordChange, setUserForPasswordChange] = useState<UserResponse | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);

    const [page, setPage] = useState(0);
    const size = 8;
    const [sort, setSort] = useState<SortConfig>({ key: 'name', direction: 'asc' });

    const { data: usersPage, isLoading, isError, error, isFetching } = useQuery<Page<UserResponse>, Error>({
        queryKey: ['users', page, size, sort],
        queryFn: () => adminService.getUsers({ page, size, sort: `${sort.key},${sort.direction}` }),
    });

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
        mutationFn: (variables: { id: number; data: UserUpdateData }) =>
            adminService.updateUser(variables.id, variables.data),
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
        mutationFn: (variables: { id: number; data: { active: boolean } }) =>
            adminService.updateUserStatus(variables.id, variables.data),
        ...mutationOptions,
        onSuccess: () => {
            toast.success('Estado del usuario actualizado.');
            mutationOptions.onSuccess();
        },
        onError: (err) => handleMutationError(err, 'Error al cambiar el estado.'),
    });

    const changePasswordMutation = useMutation({
        mutationFn: (variables: { id: number; data: PasswordUpdateData }) =>
            adminService.changeUserPassword(variables.id, variables.data),
        ...mutationOptions,
        onSuccess: (successMessage: string) => {
            toast.success(successMessage);
            setIsPasswordModalOpen(false);
        },
        onError: (err) => handleMutationError(err, 'Error al cambiar la contraseña.'),
    });

    const handleOpenCreateForm = () => { setCurrentUser(null); setIsFormModalOpen(true); };
    const handleOpenEditForm = (user: UserResponse) => { setCurrentUser(user); setIsFormModalOpen(true); };
    const handleOpenPasswordModal = (user: UserResponse) => { setUserForPasswordChange(user); setIsPasswordModalOpen(true); };
    const handleOpenDeleteModal = (user: UserResponse) => { setUserToDelete(user); };

    const handleSaveForm = (data: UserCreateData | UserUpdateData) => {
        if (currentUser) {
            updateUserMutation.mutate({ id: currentUser.id, data: data as UserUpdateData });
        } else {
            createUserMutation.mutate(data as UserCreateData);
        }
    };

    const handleConfirmDelete = () => {
        if (userToDelete) { deleteUserMutation.mutate(userToDelete.id); }
    };

    const handlePasswordSave = (passwordData: PasswordUpdateData) => {
        if (userForPasswordChange) {
            changePasswordMutation.mutate({ id: userForPasswordChange.id, data: passwordData });
        }
    };

    const handleSort = (key: string) => {
        setSort(prevSort => ({
            key,
            direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc',
        }));
        setPage(0);
    };

    if (isLoading) return <LoadingState message="Cargando usuarios..." />;
    if (isError) return <ErrorState message={error.message} />;

    const users = usersPage?.content ?? [];

    return (
        <UserManagementView
            users={users}
            usersPage={usersPage}
            isFetching={isFetching}
            sort={sort}
            isFormModalOpen={isFormModalOpen}
            currentUser={currentUser}
            isPasswordModalOpen={isPasswordModalOpen}
            userForPasswordChange={userForPasswordChange}
            userToDelete={userToDelete}
            isFormSaving={createUserMutation.isPending || updateUserMutation.isPending}
            isPasswordSaving={changePasswordMutation.isPending}
            isDeleting={deleteUserMutation.isPending}
            onOpenCreateForm={handleOpenCreateForm}
            onOpenEditForm={handleOpenEditForm}
            onSaveForm={handleSaveForm}
            onCloseFormModal={() => setIsFormModalOpen(false)}
            onOpenPasswordModal={handleOpenPasswordModal}
            onClosePasswordModal={() => setIsPasswordModalOpen(false)}
            onPasswordSave={handlePasswordSave}
            onOpenDeleteModal={handleOpenDeleteModal}
            onCloseDeleteModal={() => setUserToDelete(null)}
            onConfirmDelete={handleConfirmDelete}
            onUpdateUserStatus={(userId, active) =>
                updateUserStatusMutation.mutate({ id: userId, data: { active } })
            }
            isStatusUpdating={(userId) =>
                updateUserStatusMutation.isPending && updateUserStatusMutation.variables?.id === userId
            }
            onSort={handleSort}
            onPrevPage={() => setPage(page - 1)}
            onNextPage={() => setPage(page + 1)}
        />
    );
};

export default UserManagement;
