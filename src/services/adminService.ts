// src/services/adminService.ts

import authService from './authService';
import type { Page } from '../types/audit.types'; // Reutilizamos la interfaz de paginación
import type { UserResponse, UserCreateData, UserUpdateData, UserStatusUpdateData, PasswordUpdateData, UserRequestParams } from '../types/user.types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;
const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Obtiene los usuarios desde la API con paginación y ordenamiento.
 * @param params Objeto con los parámetros de paginación (page, size, sort).
 * @returns Una promesa que resuelve al objeto de paginación de la API.
 */
const getUsers = async (params: UserRequestParams = {}): Promise<Page<UserResponse>> => {
    // Construimos los query params, con valores por defecto si no se proveen.
    const queryParams = new URLSearchParams({
        page: (params.page ?? 0).toString(),
        size: (params.size ?? 10).toString(),
        sort: params.sort ?? 'name,asc',
    });

    const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Error al obtener la lista de usuarios.');
    }

    return await response.json();
};

/**
 * Crea un nuevo usuario (Analista u Operario).
 */
const createUser = async (userData: UserCreateData): Promise<any> => {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al crear el usuario.');
    return await response.text();
};

/**
 * Actualiza los datos de un usuario.
 */
const updateUser = async (id: number, userData: UserUpdateData): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al actualizar el usuario.');
    return await response.json();
};

/**
 * Elimina un usuario por su ID.
 */
const deleteUser = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el usuario.');
};
/**
 * Actualiza el estado (activo/inactivo) de un usuario.
 */
const updateUserStatus = async (id: number, statusData: UserStatusUpdateData): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(statusData),
    });
    if (!response.ok) throw new Error('Error al actualizar el estado del usuario.');
    return await response.json();
};
/**
 * Cambia la contraseña de un usuario.
 */
const changeUserPassword = async (id: number, passwordData: PasswordUpdateData): Promise<string> => {
    const response = await fetch(`${API_URL}/users/${id}/password`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(passwordData),
    });
    if (!response.ok) throw new Error('Error al cambiar la contraseña.');
    return await response.text();
};


const adminService = {
    getUsers,
    createUser,
    updateUser,
    updateUserStatus, 
    changeUserPassword, 
    deleteUser,
};

export default adminService;