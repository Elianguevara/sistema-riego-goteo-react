import authService from './authService';
import type { UserResponse, UserUpdateData } from '../types/user.types';
import type { SelfPasswordUpdateData } from '../types/user.types'; // Añadiremos este tipo en el siguiente paso

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/me`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Devuelve los datos del perfil del usuario que realiza la petición.
 * Endpoint: GET /api/me
 */
const getMyProfile = async (): Promise<UserResponse> => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Error al obtener los datos del perfil.');
    }
    return response.json();
};

/**
 * Actualiza el nombre y el email del usuario logueado.
 * Endpoint: PUT /api/me/profile
 */
const updateMyProfile = async (userData: UserUpdateData): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar el perfil.');
    }
    return response.json();
};

/**
 * Actualiza la contraseña del usuario logueado.
 * Endpoint: PUT /api/me/password
 */
const changeMyPassword = async (passwordData: SelfPasswordUpdateData): Promise<string> => {
    const response = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al cambiar la contraseña.');
    }
    return response.text();
};


const userService = {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
};

export default userService;