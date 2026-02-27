import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import userService from '../services/userService';
import type { SelfPasswordUpdateData, UserResponse, UserUpdateData } from '../types/user.types';
import EditProfileModal from '../components/profile/EditProfileModal'; // Crearemos este
import ChangeSelfPasswordModal from '../components/profile/ChangeSelfPasswordModal'; // Crearemos este
import './UserProfile.css'; // Crearemos este
import { useAuthData } from '../hooks/useAuthData'; // Reutilizamos el hook
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

const UserProfile = () => {
    const queryClient = useQueryClient();
    const authData = useAuthData();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const { data: user, isLoading, isError, error } = useQuery<UserResponse, Error>({
        queryKey: ['myProfile'],
        queryFn: userService.getMyProfile,
        staleTime: 1000 * 60 * 5, // Cachear datos del perfil por 5 minutos
    });

    const updateProfileMutation = useMutation({
        mutationFn: userService.updateMyProfile,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['myProfile'], updatedUser); // Actualiza la caché instantáneamente
            toast.success('Perfil actualizado exitosamente.');
            setIsEditModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al actualizar.'),
    });

    const changePasswordMutation = useMutation({
        mutationFn: userService.changeMyPassword,
        onSuccess: (message) => {
            toast.success(message);
            setIsPasswordModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al cambiar contraseña.'),
    });

    if (isLoading) return <LoadingState message="Cargando perfil..." />;
    if (isError) return <ErrorState message={error.message} />;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-lg">
                    <span>{authData?.username?.substring(0, 2).toUpperCase()}</span>
                </div>
                <h2>{user?.name}</h2>
            </div>

            <div className="profile-card">
                <h3>Perfil de usuario</h3>
                <div className="profile-details">
                    <div className="detail-item">
                        <span className="detail-label">Nombre</span>
                        <span className="detail-value">{user?.name}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Nombre de usuario</span>
                        <span className="detail-value">{user?.username}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{user?.email}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Último login</span>
                        <span className="detail-value">
                            {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('es-AR') : 'N/A'}
                        </span>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="btn-secondary" onClick={() => setIsEditModalOpen(true)}>Editar perfil</button>
                    <button className="btn-primary" onClick={() => setIsPasswordModalOpen(true)}>Cambiar contraseña</button>
                </div>
            </div>

            {isEditModalOpen && user && (
                <EditProfileModal
                    currentUser={user}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={(data: UserUpdateData) => updateProfileMutation.mutate(data)}
                    isLoading={updateProfileMutation.isPending}
                />
            )}

            {isPasswordModalOpen && (
                <ChangeSelfPasswordModal
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSave={(data: SelfPasswordUpdateData) => changePasswordMutation.mutate(data)}
                    isLoading={changePasswordMutation.isPending}
                />
            )}
        </div>
    );
};

export default UserProfile;